import { getLogger, RealtimeDeleted, RealtimeSaved } from "../../../../core/platform/framework";
import {
  CreateResult,
  CrudException,
  DeleteResult,
  ExecutionContext,
  ListResult,
  OperationType,
  Pagination,
  SaveResult,
  UpdateResult,
} from "../../../../core/platform/framework/api/crud-service";

import {
  Channel as ChannelEntity,
  ChannelMember,
  ChannelMemberPrimaryKey,
  ChannelMemberReadCursors,
  getChannelMemberInstance,
  getMemberOfChannelInstance,
  MemberOfChannel,
  ReadSection,
} from "../../entities";
import {
  ChannelExecutionContext,
  ChannelMemberType,
  ChannelVisibility,
  WorkspaceExecutionContext,
} from "../../types";
import { Channel, ResourceEventsPayload, User } from "../../../../utils/types";
import { cloneDeep, isNil, omitBy } from "lodash";
import { updatedDiff } from "deep-object-diff";
import { pick } from "../../../../utils/pick";
import { getMemberPath, getRoomName } from "./realtime";
import { ChannelListOptions } from "../../web/types";
import { ResourcePath } from "../../../../core/platform/services/realtime/types";
import Repository from "../../../../core/platform/services/database/services/orm/repository/repository";
import { localEventBus } from "../../../../core/platform/framework/event-bus";
import { plainToClass } from "class-transformer";
import {
  ChannelCounterEntity,
  ChannelCounterPrimaryKey,
  ChannelUserCounterType,
  TYPE as ChannelCounterEntityType,
} from "../../entities/channel-counters";
import { CounterProvider } from "../../../../core/platform/services/counter/provider";
import { countRepositoryItems } from "../../../../utils/counters";
import NodeCache from "node-cache";
import { UserPrimaryKey } from "../../../user/entities/user";
import { WorkspacePrimaryKey } from "../../../workspaces/entities/workspace";

import gr from "../../../global-resolver";
import uuidTime from "uuid-time";
import { ChannelObject } from "../channel/types";
import { CompanyExecutionContext } from "../../../applications/web/types";
const USER_CHANNEL_KEYS = [
  "id",
  "company_id",
  "workspace_id",
  "user_id",
  "channel_id",
  "type",
  "last_access",
  "last_increment",
  "favorite",
  "notification_level",
  "expiration",
] as const;

const CHANNEL_MEMBERS_KEYS = [
  "company_id",
  "workspace_id",
  "user_id",
  "channel_id",
  "type",
] as const;

const logger = getLogger("channel.member");

export class MemberServiceImpl {
  version: "1";
  userChannelsRepository: Repository<ChannelMember>;
  channelMembersRepository: Repository<MemberOfChannel>;
  channelMembersReadCursorRepository: Repository<ChannelMemberReadCursors>;
  private channelCounter: CounterProvider<ChannelCounterEntity>;
  private cache: NodeCache;

  async init(): Promise<this> {
    try {
      this.userChannelsRepository = await gr.database.getRepository("user_channels", ChannelMember);
      this.channelMembersRepository = await gr.database.getRepository(
        "channel_members",
        MemberOfChannel,
      );
      this.channelMembersReadCursorRepository = await gr.database.getRepository(
        "channel_members_read_cursors",
        ChannelMemberReadCursors,
      );
    } catch (err) {
      logger.error({ err }, "Can not initialize channel member service");
    }

    const channelCountersRepository = await gr.database.getRepository<ChannelCounterEntity>(
      ChannelCounterEntityType,
      ChannelCounterEntity,
    );

    this.channelCounter = await gr.platformServices.counter.getCounter<ChannelCounterEntity>(
      channelCountersRepository,
    );

    this.channelCounter.setReviseCallback(async (pk: ChannelCounterPrimaryKey) => {
      if (pk.counter_type === ChannelUserCounterType.MESSAGES) {
        return;
      }
      const type =
        ChannelUserCounterType.MEMBERS === pk.counter_type
          ? ChannelMemberType.MEMBER
          : ChannelMemberType.GUEST;
      return countRepositoryItems(
        this.channelMembersRepository,
        { channel_id: pk.id, company_id: pk.company_id, workspace_id: pk.workspace_id },
        { type },
      );
    }, 400);

    this.cache = new NodeCache({ stdTTL: 1, checkperiod: 120 });

    return this;
  }

  @RealtimeSaved<ChannelMember>((member, context) => {
    return [
      //Send member preferences update to channels collections
      {
        room: `/companies/${member.company_id}/workspaces/${member.workspace_id}/channels?type=${
          member.workspace_id === ChannelVisibility.DIRECT ? "direct" : "private"
        }&user=${member.user_id}`,
        resource: {
          company_id: member.company_id,
          workspace_id: member.workspace_id,
          id: member.channel_id,
          user_member: member,
        },
      },
      {
        room: ResourcePath.get(getRoomName(context as ChannelExecutionContext)),
        path: getMemberPath(member, context as ChannelExecutionContext),
      },
    ];
  })
  async save(
    member: ChannelMember,
    context: ChannelExecutionContext,
  ): Promise<SaveResult<ChannelMember>> {
    let memberToSave: ChannelMember;
    const channel = await gr.services.channels.channels.get(context.channel, context);

    if (!channel) {
      throw CrudException.notFound("Channel does not exists");
    }

    const memberToUpdate = await this.userChannelsRepository.findOne(
      this.getPrimaryKey(member),
      {},
      context,
    );
    const mode = memberToUpdate ? OperationType.UPDATE : OperationType.CREATE;

    logger.debug(`MemberService.save - ${mode} member %o`, memberToUpdate);

    if (mode === OperationType.UPDATE) {
      const isCurrentUser = this.isCurrentUser(memberToUpdate, context.user);

      if (!isCurrentUser) {
        throw CrudException.badRequest(`Channel member ${member.user_id} can not be updated`);
      }

      const updatableParameters: Partial<Record<keyof ChannelMember, boolean>> = {
        notification_level: isCurrentUser,
        favorite: isCurrentUser,
        last_access: isCurrentUser,
        last_increment: isCurrentUser,
      };

      // Diff existing channel and input one, cleanup all the undefined fields for all objects
      const memberDiff = omitBy(updatedDiff(memberToUpdate, member), isNil);
      const fields = Object.keys(memberDiff) as Array<Partial<keyof ChannelMember>>;

      if (!fields.length) {
        return new SaveResult<ChannelMember>("channel_member", member, mode);
      }

      const updatableFields = fields.filter(field => updatableParameters[field]);

      if (!updatableFields.length) {
        throw CrudException.badRequest("Current user can not update requested fields");
      }

      memberToSave = cloneDeep(memberToUpdate);

      //Ensure it is a boolean
      memberToSave.favorite = !!memberToSave.favorite;

      updatableFields.forEach(field => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (memberToSave as any)[field] = member[field];
      });

      await this.saveChannelMember(memberToSave, context);
      this.onUpdated(
        context.channel,
        memberToSave,
        new UpdateResult<ChannelMember>("channel_member", memberToSave),
      );
    } else {
      const currentUserIsMember = !!(await this.getChannelMember(
        context.user,
        channel,
        undefined,
        context,
      ));
      const isPrivateChannel = ChannelEntity.isPrivateChannel(channel);
      const isPublicChannel = ChannelEntity.isPublicChannel(channel);
      const isDirectChannel = ChannelEntity.isDirectChannel(channel);
      const userIsDefinedInChannelUserList = (channel.members || []).includes(
        String(member.user_id),
      );
      const isChannelCreator = context.user && String(channel.owner) === String(context.user.id);

      // 1. Private channel: user can not join private channel by themself when it is private
      // only member can add other users in channel
      // 2. The channel creator check is only here on channel creation
      if (
        isChannelCreator ||
        isPublicChannel ||
        context.user.server_request ||
        (isPrivateChannel && currentUserIsMember) ||
        (isDirectChannel && userIsDefinedInChannelUserList)
      ) {
        const memberToSave = { ...member, ...context.channel };
        await this.saveChannelMember(memberToSave, context);

        await this.usersCounterIncrease(channel, member.user_id);
        this.onCreated(
          channel,
          member,
          context.user,
          new CreateResult<ChannelMember>("channel_member", memberToSave),
        );
      } else {
        throw CrudException.badRequest(
          `User ${member.user_id} is not allowed to join this channel`,
        );
      }
    }

    return new SaveResult<ChannelMember>("channel_member", member, mode);
  }

  async get(pk: ChannelMemberPrimaryKey, context: ExecutionContext): Promise<ChannelMember> {
    // FIXME: Who can fetch a single member?
    return await this.userChannelsRepository.findOne(this.getPrimaryKey(pk), {}, context);
  }

  @RealtimeDeleted<ChannelMember>((member, context) => [
    {
      room: `/companies/${member.company_id}/workspaces/${member.workspace_id}/channels?type=${
        member.workspace_id === ChannelVisibility.DIRECT ? "direct" : "private"
      }&user=${member.user_id}`,
      resource: {
        company_id: member.company_id,
        workspace_id: member.workspace_id,
        id: member.channel_id,
        user_id: member.user_id,
        user_member: null,
      },
    },
    {
      room: ResourcePath.get(getRoomName(context as ChannelExecutionContext)),
      path: getMemberPath(member, context as ChannelExecutionContext),
    },
  ])
  async delete(
    pk: ChannelMemberPrimaryKey,
    context: ChannelExecutionContext,
  ): Promise<DeleteResult<ChannelMember>> {
    const memberToDelete = await this.userChannelsRepository.findOne(pk, {}, context);
    const channel = await gr.services.channels.channels.get(context.channel, context);

    if (!channel) {
      throw CrudException.notFound("Channel does not exists");
    }

    if (!memberToDelete) {
      throw CrudException.notFound("Channel member not found");
    }

    if (ChannelEntity.isDirectChannel(channel)) {
      if (!this.isCurrentUser(memberToDelete, context.user)) {
        throw CrudException.badRequest("User can not remove other users from direct channel");
      }
    }

    if (ChannelEntity.isPrivateChannel(channel)) {
      const canLeave = await this.canLeavePrivateChannel(context.user, channel);

      if (!canLeave) {
        throw CrudException.badRequest("User can not leave the private channel");
      }
    }

    await this.userChannelsRepository.remove(getChannelMemberInstance(pk), context);
    await this.channelMembersRepository.remove(getMemberOfChannelInstance(pk), context);
    await this.usersCounterIncrease(channel, pk.user_id, -1);

    this.onDeleted(memberToDelete, context.user, channel);

    return new DeleteResult<ChannelMember>("channel_member", pk as ChannelMember, true);
  }

  /**
   * List given channel members
   */
  async list(
    pagination: Pagination,
    options: ChannelListOptions,
    context: ChannelExecutionContext,
  ): Promise<ListResult<ChannelMember>> {
    const channel = await gr.services.channels.channels.get(
      {
        company_id: context.channel.company_id,
        workspace_id: context.channel.workspace_id,
        id: context.channel.id,
      },
      context,
    );

    if (!channel) {
      throw CrudException.notFound("Channel not found");
    }

    if (ChannelEntity.isDirectChannel(channel) || ChannelEntity.isPrivateChannel(channel)) {
      const isMember = await this.getChannelMember(context.user, channel, undefined, context);

      if (!isMember && !context.user.application_id && !context.user.server_request) {
        throw CrudException.badRequest("User does not have enough rights to get channels");
      }
    }

    const result = await this.channelMembersRepository.find(
      {
        company_id: context.channel.company_id,
        workspace_id: context.channel.workspace_id,
        channel_id: context.channel.id,
      },
      { pagination },
      context,
    );

    const companyUsers = await gr.services.companies.getUsers(
      {
        group_id: context.channel.company_id,
      },
      new Pagination(),
      { userIds: result.getEntities().map(member => member.user_id) },
    );

    if (options.company_role) {
      companyUsers.filterEntities(entity => entity.role === options.company_role);
    }

    const companyUserIds = companyUsers.getEntities().map(entity => entity.user_id);

    result.filterEntities(cm => companyUserIds.includes(cm.user_id));

    return new ListResult<ChannelMember>(
      "channel_member",
      result
        .getEntities()
        .map(member => plainToClass(ChannelMember, { id: member.user_id, ...member })),
      result.nextPage,
    );
  }

  async listAllUserChannelsIds(
    user_id: string,
    company_id: string,
    workspace_id: string,
    context: ExecutionContext,
  ): Promise<string[]> {
    let pagination = new Pagination(null);
    const channels: string[] = [];
    let result: ListResult<ChannelMember>;
    let hasMoreItems = true;
    do {
      result = await this.userChannelsRepository.find(
        {
          company_id,
          workspace_id,
          user_id,
        },
        { pagination },
        context,
      );
      if (result.isEmpty()) {
        hasMoreItems = false;
      } else {
        result.getEntities().forEach(entity => {
          channels.push(entity.channel_id);
        });
        if (!result.nextPage.page_token) hasMoreItems = false;
        else pagination = new Pagination(result.nextPage.page_token);
      }
    } while (hasMoreItems);
    return channels;
  }

  async listUserChannels(
    user: User,
    pagination: Pagination,
    context: WorkspaceExecutionContext,
  ): Promise<ListResult<ChannelMember>> {
    const result = await this.userChannelsRepository.find(
      {
        company_id: context.workspace.company_id,
        workspace_id: context.workspace.workspace_id,
        user_id: user.id,
      },
      { pagination },
      context,
    );

    return new ListResult<ChannelMember>(
      "channel_member",
      result
        .getEntities()
        .map(member => plainToClass(ChannelMember, { id: member.user_id, ...member })),
      result.nextPage,
    );
  }

  /**
   * Can leave only if the number of members is > 1
   * since counting rows in DB takes too much time
   * we query a list for 2 members without offset and check the length
   */
  async canLeavePrivateChannel(user: User, channel: ChannelEntity): Promise<boolean> {
    const list = this.list(new Pagination(undefined, "2"), {}, { channel, user });

    return (await list).getEntities().length > 1;
  }

  async addUsersToChannel(
    users: Pick<User, "id">[] = [],
    channel: ChannelEntity & { stats: ChannelObject["stats"] },
    context?: ExecutionContext,
  ): Promise<
    ListResult<{ channel: ChannelEntity; added: boolean; member?: ChannelMember; err?: Error }>
  > {
    if (!channel) {
      throw CrudException.badRequest("Channel is required");
    }
    logger.debug(
      "Add users %o to channel %o",
      users.map(u => u.id),
      channel.id,
    );

    await gr.services.channels.channels.completeWithStatistics([channel]);

    const members: Array<{
      channel: ChannelEntity;
      added: boolean;
      member?: ChannelMember;
      err?: Error;
    }> = await Promise.all(
      users.map(async user => {
        const channelContext: ChannelExecutionContext = {
          channel,
          user: context?.user || user,
        };

        const member: ChannelMember = getChannelMemberInstance({
          channel_id: channel.id,
          company_id: channel.company_id,
          workspace_id: channel.workspace_id,
          user_id: user.id,
          last_increment: channel.stats.messages,
          last_access: Date.now(),
        } as ChannelMember);

        try {
          const isAlreadyMember = await this.getChannelMember(user, channel, undefined, context);
          if (isAlreadyMember) {
            logger.debug("User %s is already member in channel %s", member.user_id, channel.id);
            return { channel, added: false };
          }

          const result = await this.save(member, channelContext);

          return {
            channel,
            added: true,
            member: result.entity,
          };
        } catch (err) {
          logger.warn({ err }, "Member has not been added %o", member);
          return {
            channel,
            err,
            added: false,
          };
        }
      }),
    );

    return new ListResult("channel_member", members);
  }

  async addUserToChannels(
    user: Pick<User, "id">,
    channels: ChannelEntity[],
  ): Promise<
    ListResult<{ channel: ChannelEntity; added: boolean; member?: ChannelMember; err?: Error }>
  > {
    logger.debug(
      "Add user %s to channels %o",
      user.id,
      channels.map(c => c.id),
    );
    const members: Array<{
      channel: ChannelEntity;
      added: boolean;
      member?: ChannelMember;
      err?: Error;
    }> = await Promise.all(
      channels.map(async channel => {
        const context: ChannelExecutionContext = {
          channel,
          user,
        };

        const member = getChannelMemberInstance({
          channel_id: channel.id,
          company_id: channel.company_id,
          workspace_id: channel.workspace_id,
          user_id: user.id,
        });

        try {
          const isAlreadyMember = await this.getChannelMember(user, channel, undefined, context);
          if (isAlreadyMember) {
            logger.debug("User %s is already member in channel %s", member.user_id, channel.id);
            return { channel, added: false };
          }

          const result = await this.save(member, context);

          return { channel, member: result.entity, added: true };
        } catch (err) {
          logger.warn({ err }, "Member has not been added %o", member);
          return { channel, added: false, err };
        }
      }),
    );

    return new ListResult("channel_member", members);
  }

  onUpdated(
    channel: Channel,
    member: ChannelMember,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateResult: UpdateResult<ChannelMember>,
  ): void {
    logger.debug("Member updated %o", member);

    gr.platformServices.messageQueue.publish("channel:member:updated", {
      data: {
        channel,
        member,
      },
    });
  }

  onCreated(
    channel: ChannelEntity,
    member: ChannelMember,
    user: User,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createResult: SaveResult<ChannelMember>,
  ): void {
    logger.debug("Member created %o", member);

    gr.platformServices.messageQueue.publish<ResourceEventsPayload>("channel:member:created", {
      data: {
        channel,
        user,
        member,
      },
    });

    localEventBus.publish<ResourceEventsPayload>("channel:member:created", {
      channel,
      user,
      member,
      actor: user,
      resourcesAfter: [member],
    });
  }

  onDeleted(member: ChannelMember, user: User, channel: ChannelEntity): void {
    logger.debug("Member deleted %o", member);

    gr.platformServices.messageQueue.publish<ResourceEventsPayload>("channel:member:deleted", {
      data: {
        channel,
        user,
        member,
      },
    });

    localEventBus.publish<ResourceEventsPayload>("channel:member:deleted", {
      actor: user,
      resourcesBefore: [member],
      channel,
      user,
      member,
    });
  }

  isCurrentUser(member: ChannelMember | MemberOfChannel, user: User): boolean {
    return String(member.user_id) === String(user.id);
  }

  async getChannelMember(
    user: User,
    channel: Partial<Pick<Channel, "company_id" | "workspace_id" | "id">>,
    cacheTtlSec?: number,
    context?: ExecutionContext,
  ): Promise<ChannelMember> {
    if (!user) {
      return;
    }

    if (cacheTtlSec) {
      const pk = JSON.stringify({ user, channel });
      if (this.cache.has(pk)) return this.cache.get<ChannelMember>(pk);
      const entity = await this.getChannelMember(user, channel, undefined, context);
      this.cache.set<ChannelMember>(pk, entity, cacheTtlSec);
      return entity;
    }

    return this.get(
      {
        channel_id: channel.id,
        company_id: channel.company_id,
        workspace_id: channel.workspace_id,
        user_id: user.id,
      },
      context,
    );
  }

  getPrimaryKey(
    memberOrPrimaryKey: ChannelMember | ChannelMemberPrimaryKey,
  ): ChannelMemberPrimaryKey {
    return pick(
      memberOrPrimaryKey,
      ...(["company_id", "workspace_id", "channel_id", "user_id"] as const),
    );
  }

  private async usersCounterIncrease(channel: Channel, userId: string, increaseValue: number = 1) {
    // const isMember = await this.isCompanyMember(channel.company_id, userId);
    const isMember = true; // Since actually all users are now added to the channel as members, we are removing the guest counter for now.
    const counter_type = isMember ? ChannelUserCounterType.MEMBERS : ChannelUserCounterType.GUESTS;
    return this.channelCounter.increase(
      {
        id: channel.id,
        company_id: channel.company_id,
        workspace_id: channel.workspace_id,
        counter_type,
      },
      increaseValue,
    );
  }

  getUsersCount(pk: ChannelCounterPrimaryKey): Promise<number> {
    return this.channelCounter.get(pk);
  }

  async isCompanyMember(companyId: string, userId: string): Promise<boolean> {
    return (await gr.services.companies.getUserRole(companyId, userId)) != "guest";
  }

  private async saveChannelMember(
    memberToSave: ChannelMember & Channel,
    context: ExecutionContext,
  ) {
    const userChannel = getChannelMemberInstance(pick(memberToSave, ...USER_CHANNEL_KEYS));
    const channelMember = getMemberOfChannelInstance(pick(memberToSave, ...CHANNEL_MEMBERS_KEYS));
    await this.userChannelsRepository.save(userChannel, context);
    await this.channelMembersRepository.save(channelMember, context);
  }

  async ensureUserNotInWorkspaceIsNotInChannel(
    userPk: UserPrimaryKey,
    workspacePk: WorkspacePrimaryKey,
    context: ExecutionContext,
  ) {
    const workspace = await gr.services.workspaces.get(workspacePk);
    const member = await gr.services.workspaces.getUser({
      workspaceId: workspace.id,
      userId: userPk.id,
    });
    if (!member) {
      const result = await this.userChannelsRepository.find(
        {
          company_id: workspace.company_id,
          workspace_id: workspace.id,
          user_id: userPk.id,
        },
        {},
        context,
      );
      for (const channel of result.getEntities()) {
        logger.warn(
          `User ${userPk.id} is not in workspace ${workspace.id} so it will be removed from channel ${channel.id}`,
        );
        await this.delete(channel, { user: { id: userPk.id }, channel });
      }
    }
  }

  /**
   * The list of members read sections of the channel.
   *
   * @param {ChannelExecutionContext} context - The context of the execution.
   * @returns {Promise<ListResult<ChannelMemberReadCursors>>} - The channel members read cursors.
   */
  async getChannelMembersReadSections(
    context: ChannelExecutionContext,
  ): Promise<ListResult<ChannelMemberReadCursors>> {
    try {
      const readCursors = await this.channelMembersReadCursorRepository.find(
        {
          company_id: context.channel.company_id,
          channel_id: context.channel.id,
        },
        { pagination: { limitStr: "100" } },
        context,
      );

      return new ListResult<ChannelMemberReadCursors>(
        "channel_members_read_cursors",
        readCursors.getEntities(),
      );
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * The channel member read section of the channel.
   *
   * @param {ChannelExecutionContext} context - The context of the execution.
   * @returns {Promise<ChannelMemberReadCursors>} - The channel member read cursors.
   */
  async getChannelMemberReadSections(
    member: string,
    context: ChannelExecutionContext,
  ): Promise<ChannelMemberReadCursors> {
    try {
      const readCursors = await this.channelMembersReadCursorRepository.findOne(
        {
          company_id: context.channel.company_id,
          channel_id: context.channel.id,
          user_id: member,
        },
        {},
        context,
      );

      return readCursors;
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   * Updates the channel member read section.
   *
   * @param {{ start: string; end: string }} section - The section to save the cursor for.
   * @param {CompanyExecutionContext & { channel_id: string }} context - The channel execution context.
   * @returns {Promise<SaveResult<ChannelMemberReadCursors>>} - The result of the save operation.
   */
  async setChannelMemberReadSections(
    section: { start: string; end: string },
    context: CompanyExecutionContext & { channel_id: string; workspace_id: string },
  ): Promise<SaveResult<ChannelMemberReadCursors>> {
    const member = await this.getChannelMember(
      context.user,
      {
        id: context.channel_id,
        company_id: context.company.id,
        workspace_id: context.workspace_id,
      },
      null,
      context,
    );

    if (!member) {
      throw CrudException.badRequest(
        `User ${context.user.id} is not a member of channel ${context.channel_id}`,
      );
    }

    const existingReadSection = await this.channelMembersReadCursorRepository.findOne(
      {
        company_id: context.company.id,
        channel_id: context.channel_id,
        user_id: context.user.id,
      },
      {},
      context,
    );

    const { start, end } = section;

    if (
      !existingReadSection ||
      !existingReadSection.read_section ||
      !existingReadSection.read_section.length
    ) {
      const newMemberReadCursor = new ChannelMemberReadCursors();
      newMemberReadCursor.company_id = context.company.id;
      newMemberReadCursor.channel_id = context.channel_id;
      newMemberReadCursor.user_id = context.user.id;
      newMemberReadCursor.read_section = [start, end] as ReadSection;

      await this.channelMembersReadCursorRepository.save(newMemberReadCursor, context);

      return new SaveResult<ChannelMemberReadCursors>(
        "channel_members_read_cursors",
        newMemberReadCursor,
        OperationType.CREATE,
      );
    }

    const updatedReadSection = { start, end };
    const [existingStart, existingEnd] = existingReadSection.read_section;
    const existingStartTime = uuidTime.v1(existingStart);
    const existingEndTime = uuidTime.v1(existingEnd);
    const startTime = uuidTime.v1(start);
    const endTime = uuidTime.v1(end);

    if (existingStartTime < startTime) {
      updatedReadSection.start = existingStart;
    }

    if (existingEndTime > endTime) {
      updatedReadSection.end = existingEnd;
    }

    if (existingStart === updatedReadSection.start && existingEnd === updatedReadSection.end) {
      return new SaveResult<ChannelMemberReadCursors>(
        "channel_members_read_cursors",
        existingReadSection,
        OperationType.EXISTS,
      );
    }

    existingReadSection.read_section = [updatedReadSection.start, updatedReadSection.end];
    await this.channelMembersReadCursorRepository.save(existingReadSection, context);

    return new SaveResult<ChannelMemberReadCursors>(
      "channel_members_read_cursors",
      existingReadSection,
      OperationType.UPDATE,
    );
  }

  /**
   * list users who have seen the message.
   *
   * @param {String} id - the message id
   * @param {ChannelExecutionContext} context - the thread execution context
   * @returns { Promise<string[]>} - the promise containing the user id list
   */
  async getChannelMessageSeenByUsers(
    id: string,
    context: ChannelExecutionContext,
  ): Promise<string[]> {
    const channelReadSections = await this.getChannelMembersReadSections(context);

    return channelReadSections
      .getEntities()
      .filter(section => {
        const sectionEnd = section.read_section[1];
        const sectionEndTime = uuidTime.v1(sectionEnd);
        const messageTime = uuidTime.v1(id);

        return messageTime <= sectionEndTime;
      })
      .map(section => section.user_id);
  }
}
