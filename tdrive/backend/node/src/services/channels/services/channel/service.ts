import _, { cloneDeep, find } from "lodash";
import { diff } from "deep-object-diff";
import {
  getLogger,
  RealtimeDeleted,
  RealtimeSaved,
  RealtimeUpdated,
} from "../../../../core/platform/framework";
import {
  CrudException,
  DeleteResult,
  ExecutionContext,
  ListResult,
  OperationType,
  Pagination,
  SaveResult,
  UpdateResult,
} from "../../../../core/platform/framework/api/crud-service";
import { ChannelActivityMessage, ChannelObject, SearchChannelOptions } from "./types";
import {
  Channel,
  ChannelMember,
  ChannelPrimaryKey,
  DefaultChannel,
  UserChannel,
  UsersIncludedChannel,
} from "../../entities";
import { getChannelPath, getRoomName } from "./realtime";
import { ChannelType, ChannelVisibility, WorkspaceExecutionContext } from "../../types";
import { isWorkspaceAdmin as userIsWorkspaceAdmin } from "../../../../utils/workspace";
import { ResourceEventsPayload, User } from "../../../../utils/types";
import { pick } from "../../../../utils/pick";
import {
  DirectChannel,
  getInstance as getDirectChannelInstance,
} from "../../entities/direct-channel";
import { ChannelListOptions, ChannelSaveOptions } from "../../web/types";
import { isDirectChannel } from "../../utils";
import { ResourcePath } from "../../../../core/platform/services/realtime/types";
import Repository, {
  FindFilter,
} from "../../../../core/platform/services/database/services/orm/repository/repository";
import { ChannelActivity } from "../../entities/channel-activity";
import { localEventBus } from "../../../../core/platform/framework/event-bus";
import DefaultChannelServiceImpl from "./default/service";
import { formatUser } from "../../../../utils/users";
import gr from "../../../global-resolver";
import {
  KnowledgeGraphEvents,
  KnowledgeGraphGenericEventPayload,
} from "../../../../core/platform/services/knowledge-graph/types";
import { ChannelUserCounterType } from "../../entities/channel-counters";
import { Readable } from "stream";
import sharp from "sharp";

const logger = getLogger("channel.service");

export class ChannelServiceImpl {
  version: "1";
  activityRepository: Repository<ChannelActivity>;
  channelRepository: Repository<Channel>;
  directChannelRepository: Repository<DirectChannel>;
  defaultChannelService: DefaultChannelServiceImpl;

  async init(): Promise<this> {
    this.defaultChannelService = new DefaultChannelServiceImpl();

    try {
      this.activityRepository = await gr.database.getRepository(
        "channel_activity",
        ChannelActivity,
      );
      this.channelRepository = await gr.database.getRepository("channels", Channel);
      this.directChannelRepository = await gr.database.getRepository(
        "direct_channels",
        DirectChannel,
      );
    } catch (err) {
      logger.error({ err }, "Can not initialize channel db service");
    }

    try {
      await this.defaultChannelService.init();
    } catch (err) {
      logger.warn("Can not initialize default channel service", err);
    }

    localEventBus.subscribe<ResourceEventsPayload>("workspace:user:deleted", async data => {
      if (data?.user?.id && data?.company?.id)
        gr.services.channels.members.ensureUserNotInWorkspaceIsNotInChannel(
          data.user,
          data.workspace,
          undefined,
        );
    });

    return this;
  }

  async thumbnail(channelId: string, context?: ExecutionContext): Promise<{ file: Readable }> {
    const logoInternalPath = `/channels/${channelId}/thumbnail.jpg`;
    const file = await gr.platformServices.storage.read(logoInternalPath, {}, context);
    return { file };
  }

  @RealtimeSaved<Channel>((channel, context) => [
    {
      room: ResourcePath.get(getRoomName(channel, context as WorkspaceExecutionContext)),
      path: getChannelPath(channel, context as WorkspaceExecutionContext),
    },
  ])
  async save(
    channel: Channel,
    options: ChannelSaveOptions,
    context: WorkspaceExecutionContext,
  ): Promise<SaveResult<ChannelObject>> {
    let channelToUpdate: Channel;
    let channelToSave: Channel;
    const mode = channel.id ? OperationType.UPDATE : OperationType.CREATE;
    const isDirectChannel = Channel.isDirectChannel(channel);
    const isWorkspaceAdmin =
      !isDirectChannel && (await userIsWorkspaceAdmin(context.user, context.workspace));
    const isPrivateChannel = Channel.isPrivateChannel(channel);
    const isDefaultChannel = Channel.isDefaultChannel(channel);

    channel.workspace_id = context.workspace.workspace_id || channel.workspace_id;
    channel.company_id = context.workspace.company_id || channel.company_id;

    if (isDirectChannel) {
      channel.visibility = ChannelVisibility.DIRECT;
      channel.workspace_id = ChannelVisibility.DIRECT;
    }

    if (mode === OperationType.UPDATE) {
      logger.debug("Updating channel");
      channelToUpdate = await this.get(this.getPrimaryKey(channel), context);

      if (!channelToUpdate) {
        throw CrudException.notFound("Channel not found");
      }

      const isChannelOwner = this.isChannelOwner(channelToUpdate, context.user);
      const updatableParameters: Partial<Record<keyof Channel, boolean>> = {
        name: true,
        description: !isDirectChannel,
        icon: !isDirectChannel,
        channel_group: !isDirectChannel,
        is_default: (isWorkspaceAdmin || isChannelOwner) && !isDirectChannel && !isPrivateChannel,
        visibility: !isDirectChannel && (isWorkspaceAdmin || isChannelOwner),
        archived: isWorkspaceAdmin || isChannelOwner,
        connectors: !isDirectChannel,
        is_readonly: isWorkspaceAdmin || isChannelOwner,
      };

      // Diff existing channel and input one, cleanup all the undefined fields for all objects
      const channelDiff = diff(channelToUpdate, channel);
      const fields = Object.keys(channelDiff) as Array<Partial<keyof Channel>>;

      if (!fields.length) {
        throw CrudException.badRequest("Nothing to update");
      }

      const updatableFields = fields.filter(field => updatableParameters[field]);

      if (!updatableFields.length) {
        throw CrudException.badRequest("Current user can not update requested fields");
      }

      channelToSave = cloneDeep(channelToUpdate);

      updatableFields.forEach(field => {
        if (channel[field] !== undefined) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (channelToSave as any)[field] = channel[field];
        }
      });

      localEventBus.publish<ResourceEventsPayload>("channel:updated", {
        actor: context.user,
        resourcesBefore: [channelToUpdate],
        resourcesAfter: [channel],
        channel: channel,
        user: context.user,
      });
    }

    if (mode === OperationType.CREATE) {
      if (isPrivateChannel && isDefaultChannel) {
        throw CrudException.badRequest("Private channel can not be default");
      }

      if (isDirectChannel) {
        options.members = Array.from(new Set<string>(options?.members || []).add(context.user.id));
        channel.members = options.members;

        logger.info("Direct channel creation with members %o", options.members);
        if (context.workspace.workspace_id !== ChannelVisibility.DIRECT) {
          throw CrudException.badRequest("Direct Channel creation error: bad workspace");
        }

        const directChannel = await this.getDirectChannelInCompany(
          context.workspace.company_id,
          options.members,
          context,
        );

        if (directChannel) {
          logger.debug("Direct channel already exists %o", directChannel);
          const existingChannel = await this.channelRepository.findOne(
            {
              company_id: context.workspace.company_id,
              workspace_id: ChannelType.DIRECT,
              id: directChannel.channel_id,
            },
            {},
            context,
          );
          if (existingChannel) {
            const last_activity = await this.getChannelActivity(existingChannel, context);

            const saveResult = new SaveResult(
              "channels",
              ChannelObject.mapTo(existingChannel, { last_activity }),
              OperationType.EXISTS,
            );
            await this.addContextUserToChannel(context, saveResult);

            return saveResult;
          } else {
            //Fixme: remove directChannel instance
            throw CrudException.badRequest("table inconsistency");
          }
        }
      } else {
        if (!channel.name) {
          throw CrudException.badRequest("'name' is required");
        }
      }

      channelToSave = channel;
      channelToSave.owner = context.user.id;
    }

    if (channelToSave.icon && channelToSave.icon.startsWith("data:")) {
      const logoInternalPath = `/channels/${channelToSave.id}/thumbnail.jpg`;
      const logoPublicPath = `/internal/services/channels/v1/companies/${
        channelToSave.company_id
      }/workspaces/${channelToSave.workspace_id}/channels/${
        channelToSave.id
      }/thumbnail?t=${new Date().getTime()}`;

      const image = await sharp(Buffer.from(channel.icon.split(",").pop(), "base64"))
        .resize(250, 250)
        .toBuffer();

      const s = new Readable();
      s.push(image);
      s.push(null);
      await gr.platformServices.storage.write(logoInternalPath, s);

      channelToSave.icon = logoPublicPath;
    }

    const channelActivity = await this.activityRepository.findOne(
      {
        channel_id: channel.id,
      },
      {},
      context,
    );

    logger.info("Saving channel %o", channelToSave);
    await this.channelRepository.save(channelToSave, context);

    if (!isDirectChannel) {
      channel.members = []; //Members is specific to direct channels
    }

    const saveResult = new SaveResult<ChannelObject>(
      "channel",
      {
        ...ChannelObject.mapTo(channelToSave),
        last_activity: channelActivity?.last_activity || 0,
        last_message: channelActivity?.last_message || {},
      },
      mode,
    );

    await this.addContextUserToChannel(context, saveResult);
    await this.onSaved(channelToSave, options, context, saveResult, mode);

    // Shortcut to invite members to a channel
    if (!isDirectChannel && options.members && options.members.length > 0) {
      await gr.services.channels.members.addUsersToChannel(
        options.members.map(id => {
          return { id };
        }),
        saveResult.entity,
        context,
      );
    }

    return saveResult;
  }

  async get(pk: ChannelPrimaryKey, _context?: ExecutionContext): Promise<ChannelObject> {
    const primaryKey = this.getPrimaryKey(pk);
    let channel = await this.channelRepository.findOne(primaryKey);
    if (!channel) {
      channel = await this.channelRepository.findOne({ ...primaryKey, workspace_id: "direct" });
    }
    if (!channel) return null;

    const last_activity = await this.getChannelActivity(channel);

    if (channel.visibility === ChannelVisibility.DIRECT)
      channel = await this.includeUsersInDirectChannel(channel);

    return ChannelObject.mapTo(channel, { last_activity });
  }

  @RealtimeUpdated<Channel>((channel, context) => [
    {
      room: ResourcePath.get(getRoomName(channel, context as WorkspaceExecutionContext)),
      path: getChannelPath(channel, context as WorkspaceExecutionContext),
    },
  ])
  async update(
    pk: ChannelPrimaryKey,
    channel: Channel,
    context: ExecutionContext,
  ): Promise<UpdateResult<ChannelObject>> {
    // TODO: Do the update by hand then save
    if (!pk.id) {
      throw CrudException.badRequest("Channel id is required for update");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mergeChannel: any = { ...channel, ...pk };
    await this.channelRepository.save(mergeChannel as Channel, context);

    return new UpdateResult<ChannelObject>("channel", ChannelObject.mapTo(mergeChannel));
  }

  @RealtimeDeleted<Channel>((channel, context) => [
    {
      room: ResourcePath.get(getRoomName(channel, context as WorkspaceExecutionContext)),
      path: getChannelPath(channel, context as WorkspaceExecutionContext),
    },
  ])
  async delete(
    pk: ChannelPrimaryKey,
    context: WorkspaceExecutionContext,
  ): Promise<DeleteResult<ChannelObject>> {
    const channelToDelete = await this.channelRepository.findOne(
      this.getPrimaryKey(pk),
      {},
      context,
    );

    if (!channelToDelete) {
      throw new CrudException("Channel not found", 404);
    }

    const directChannel = isDirectChannel(channelToDelete);

    if (directChannel) {
      throw new CrudException("Direct channel can not be deleted", 400);
    }

    const isWorkspaceAdmin =
      !directChannel && (await userIsWorkspaceAdmin(context.user, context.workspace));
    const isChannelOwner = this.isChannelOwner(channelToDelete, context.user);

    if (!isWorkspaceAdmin && !isChannelOwner) {
      throw new CrudException("Channel can not be deleted", 400);
    }

    await this.channelRepository.remove(channelToDelete, context);
    const result = new DeleteResult("channel", ChannelObject.mapTo(pk as Channel), true);

    this.onDeleted(channelToDelete, result);

    localEventBus.publish<ResourceEventsPayload>("channel:deleted", {
      channel: channelToDelete,
      user: context.user,
    });

    return result;
  }

  @RealtimeUpdated<ChannelActivity>((channelActivity, context) => {
    return [
      {
        room: ResourcePath.get(
          getRoomName(channelActivity.getChannelPrimaryKey(), context as WorkspaceExecutionContext),
        ),
        path: getChannelPath(
          channelActivity.getChannelPrimaryKey(),
          context as WorkspaceExecutionContext,
        ),
        resource: {
          company_id: channelActivity.company_id,
          workspace_id: channelActivity.workspace_id,
          id: channelActivity.channel_id,
          last_activity: channelActivity.last_activity,
          last_message: channelActivity.last_message,
        },
      },
    ];
  })
  async updateLastActivity(
    payload: {
      date: number;
      channel: ChannelPrimaryKey;
      message: ChannelActivityMessage | null;
    },
    context: WorkspaceExecutionContext,
  ): Promise<UpdateResult<ChannelActivity>> {
    const channelPK = payload.channel;
    const channelActivityMessage = payload.message;
    const channel = (await this.channelRepository.findOne(
      _.pick(channelPK, "company_id", "workspace_id", "id"),
      {},
      context,
    )) as ChannelObject & { stats: ChannelObject["stats"] };
    await gr.services.channels.channels.completeWithStatistics([channel]);

    const entity = new ChannelActivity();
    entity.channel_id = channelPK.id;
    entity.company_id = channelPK.company_id;
    entity.workspace_id = channelPK.workspace_id;
    entity.last_activity = payload.date;
    entity.stats = channel.stats;
    entity.last_message = channelActivityMessage
      ? {
          date: channelActivityMessage.date,
          sender: channelActivityMessage.sender,
          sender_name: channelActivityMessage.sender_name,
          title: channelActivityMessage.title,
          text: channelActivityMessage.text,
        }
      : null;

    entity.channel = channel;

    logger.info(`Update activity for channel ${entity.channel_id} to ${entity.last_activity}`);

    localEventBus.publish<KnowledgeGraphGenericEventPayload<Channel>>(
      KnowledgeGraphEvents.CHANNEL_UPSERT,
      {
        id: channel.id,
        resource: channel,
        links: [],
      },
    );

    await this.activityRepository.save(entity, context);
    return new UpdateResult<ChannelActivity>("channel_activity", entity);
  }

  public async getChannelActivity(channel: Channel, context?: ExecutionContext): Promise<number> {
    let result = 0;

    if (!channel) {
      return result;
    }

    try {
      const activity = await this.activityRepository.findOne(
        {
          company_id: channel.company_id,
          workspace_id: channel.workspace_id,
          channel_id: channel.id,
        } as ChannelActivity,
        {},
        context,
      );

      result = activity?.last_activity || 0;
    } catch (error) {
      logger.debug(`Can not get channel last activity for channel ${channel.id}`);
    }
    return result;
  }

  public async fillChannelActivities(
    channels: Channel[],
    context: ExecutionContext,
  ): Promise<ChannelObject[]> {
    const filledChannels: ChannelObject[] = [];
    for (const channel of channels) {
      const activity = await this.getChannelActivity(channel, context);
      const chObj = ChannelObject.mapTo(channel);
      chObj.last_activity = activity;
      filledChannels.push(chObj);
    }
    return filledChannels;
  }

  async list(
    pagination: Pagination,
    options: ChannelListOptions,
    context: WorkspaceExecutionContext,
  ): Promise<ListResult<Channel | UserChannel>> {
    const isDirectWorkspace = isDirectChannel(context.workspace);
    const isWorkspaceAdmin =
      !isDirectWorkspace && userIsWorkspaceAdmin(context.user, context.workspace);
    const findFilters: FindFilter = {
      company_id: context.workspace.company_id,
      workspace_id: context.workspace.workspace_id,
    };

    let user_id = context.user.id;
    if (context.user.application_id) {
      user_id = user_id || options.user_id;
    }

    if ((options?.mine || isDirectWorkspace) && user_id) {
      if (!context.user.application_id && !context.user.server_request) {
        localEventBus.publish<ResourceEventsPayload>("channel:list", {
          user: context.user,
          company: {
            id: context.workspace.company_id,
          },
        });
      }

      return this.getChannelsForUsersInWorkspace(
        context.workspace.company_id,
        context.workspace.workspace_id,
        context.user.id,
        pagination,
        context,
      );
    }

    const channels = await this.channelRepository.find(findFilters, { pagination }, context);
    channels.filterEntities(channel => channel.visibility !== ChannelVisibility.DIRECT);

    if (!isWorkspaceAdmin && !context.user.server_request) {
      channels.filterEntities(channel => channel.visibility === ChannelVisibility.PUBLIC);
    }

    return channels;
  }

  async getChannelsForUsersInWorkspace(
    companyId: string,
    workspaceId: string | "direct",
    userId: string,
    pagination?: Pagination,
    context?: ExecutionContext,
  ): Promise<ListResult<UserChannel>> {
    const isDirectWorkspace = isDirectChannel({ workspace_id: workspaceId });
    const findFilters: FindFilter = {
      company_id: companyId,
      workspace_id: workspaceId,
    };

    const userChannels = await gr.services.channels.members.listUserChannels(
      { id: userId },
      pagination,
      {
        user: {
          id: userId,
        },
        workspace: {
          workspace_id: workspaceId,
          company_id: companyId,
        },
      },
    );

    let activityPerChannel: Map<string, ChannelActivity>;
    const channels = await this.channelRepository.find(
      findFilters,
      {
        $in: [["id", userChannels.getEntities().map(channelMember => channelMember.channel_id)]],
      },
      context,
    );

    if (!channels.isEmpty()) {
      const activities = await this.activityRepository.find(
        findFilters,
        {
          $in: [["channel_id", channels.getEntities().map(channel => channel.id)]],
        },
        context,
      );

      activityPerChannel = new Map<string, ChannelActivity>(
        activities.getEntities().map(activity => [activity.channel_id, activity]),
      );
    } else {
      activityPerChannel = new Map<string, ChannelActivity>();
    }

    channels.mapEntities(<UserChannel>(channel: Channel) => {
      const userChannel = find(userChannels.getEntities(), { channel_id: channel.id });

      const channelActivity = activityPerChannel.get(channel.id);

      return {
        ...channel,
        ...{ user_member: userChannel },
        last_activity: channelActivity?.last_activity || 0,
        last_message: channelActivity?.last_message || {},
      } as unknown as UserChannel;
    });

    if (isDirectWorkspace) {
      channels.mapEntities(<UserDirectChannel>(channel: UserChannel) => {
        return {
          ...channel,
          ...{
            members: channel.members || [],
          },
        } as unknown as UserDirectChannel;
      });
    }

    return new ListResult(
      channels.type,
      channels.getEntities() as UserChannel[],
      userChannels.nextPage,
    );
  }

  async createDirectChannel(
    directChannel: DirectChannel,
    context: ExecutionContext,
  ): Promise<DirectChannel> {
    const instance = getDirectChannelInstance(directChannel);
    await this.directChannelRepository.save(instance, context);

    return instance;
  }

  getDirectChannel(
    directChannel: DirectChannel,
    context: ExecutionContext,
  ): Promise<DirectChannel> {
    return this.directChannelRepository.findOne(directChannel, {}, context);
  }

  async getDirectChannelInCompany(
    companyId: string,
    users: string[],
    context: ExecutionContext,
  ): Promise<DirectChannel> {
    const directChannel = await this.directChannelRepository.findOne(
      {
        company_id: companyId,
        users: DirectChannel.getUsersAsString(users),
      },
      {},
      context,
    );

    return directChannel;
  }

  async getDirectChannelsInCompany(
    pagination: Pagination,
    company_id: string,
    context: ExecutionContext,
  ): Promise<ListResult<Channel>> {
    return await this.channelRepository.find(
      { company_id, workspace_id: "direct" },
      { pagination },
      context,
    );
  }

  async getDirectChannelsForUsersInCompany(
    companyId: string,
    userId: string,
    context: ExecutionContext,
  ): Promise<DirectChannel[]> {
    const list = await this.directChannelRepository.find(
      {
        company_id: companyId,
      },
      {
        $like: [["users", userId]],
      },
      context,
    );

    return list.getEntities();
  }

  async markAsRead(
    pk: ChannelPrimaryKey,
    user: Pick<User, "id">,
    context: ExecutionContext,
  ): Promise<boolean> {
    const now = Date.now();
    const channel = await this.get(pk, context);

    if (!channel) {
      throw CrudException.notFound("Channel not found");
    }

    await this.completeWithStatistics([channel]);

    const member = await gr.services.channels.members.getChannelMember(
      user,
      channel,
      undefined,
      context,
    );

    if (!member) {
      throw CrudException.badRequest("User is not channel member");
    }

    // Updating the member will also publish a message in the message-queue channel
    // This message will be handled in the notification service and will update the notification preferences for the member
    // cf this.members.onUpdated
    member.last_access = now;
    member.last_increment = channel.stats.messages;
    const updatedMember = (
      await gr.services.channels.members.save(member, {
        channel,
        user,
      })
    ).entity;

    this.onRead(channel, updatedMember);

    return true;
  }

  async markAsUnread(
    pk: ChannelPrimaryKey,
    user: User,
    context: ExecutionContext,
  ): Promise<boolean> {
    const channel = await this.get(pk, context);

    if (!channel) {
      throw CrudException.notFound("Channel not found");
    }

    const member = await gr.services.channels.members.getChannelMember(user, channel);

    if (!member) {
      throw CrudException.badRequest("User is not channel member");
    }

    // do nothing here but send a notification so that notification service is updated...
    this.onUnread(channel, member);

    return true;
  }

  getDefaultChannels(
    workspace: Required<Pick<ChannelPrimaryKey, "company_id" | "workspace_id">>,
  ): Promise<DefaultChannel[]> {
    return this.defaultChannelService.getDefaultChannels(workspace);
  }

  async addUserToDefaultChannels(
    user: User,
    workspace: Required<Pick<ChannelPrimaryKey, "company_id" | "workspace_id">>,
  ): Promise<ChannelMember[]> {
    const result = await this.defaultChannelService.addUserToDefaultChannels(user, workspace);

    return result.filter(e => e.added).map(e => e.member);
  }

  getPrimaryKey(channelOrPrimaryKey: Channel | ChannelPrimaryKey): ChannelPrimaryKey {
    return pick(channelOrPrimaryKey, ...(["company_id", "workspace_id", "id"] as const));
  }

  isChannelOwner(channel: Channel, user: User): boolean {
    return channel.owner && String(channel.owner) === user.id;
  }

  async addContextUserToChannel(
    context: WorkspaceExecutionContext,
    result: SaveResult<Channel>,
  ): Promise<void> {
    const savedChannel = result.entity;

    //Add requester as member
    if (context.user.id) {
      try {
        await gr.services.channels.members.addUserToChannels({ id: context.user.id }, [
          savedChannel,
        ]);
      } catch (err) {
        logger.warn({ err }, "Can not add requester as channel member");
      }
    }
  }

  public async includeUsersInDirectChannel(
    channel: Channel,
    excludeUserId?: string,
  ): Promise<UsersIncludedChannel> {
    const channelWithUsers: UsersIncludedChannel = { users: [], ...channel };
    if (isDirectChannel(channel)) {
      const users = [];
      for (const user of channel.members) {
        if (user) {
          const e = await formatUser(await gr.services.users.getCached({ id: user }));
          if (e) users.push(e);
        }
      }
      channelWithUsers.users = users;
      channelWithUsers.name = users
        .filter(u => u.id != excludeUserId)
        .map(u => u.full_name?.trim())
        .filter(a => a)
        .join(", ");
    }
    return channelWithUsers;
  }

  /**
   * Called when channel update has been successfully called
   *
   * @param channel The channel before update has been processed
   * @param result The channel update result
   */
  async onSaved(
    channel: Channel,
    options: ChannelSaveOptions,
    context: WorkspaceExecutionContext,
    result: SaveResult<Channel>,
    mode: OperationType.CREATE | OperationType.UPDATE,
  ): Promise<void> {
    const savedChannel = result.entity;

    if (mode === OperationType.CREATE) {
      if (isDirectChannel(channel)) {
        const directChannel = {
          channel_id: savedChannel.id,
          company_id: savedChannel.company_id,
          users: DirectChannel.getUsersAsString(options.members),
        } as DirectChannel;

        await this.createDirectChannel(directChannel, context);
      } else {
        if (options.addCreatorAsMember && savedChannel.owner) {
          try {
            await gr.services.channels.members.addUserToChannels({ id: savedChannel.owner }, [
              savedChannel,
            ]);
          } catch (err) {
            logger.warn({ err }, "Can not add owner as channel member");
          }
        }
      }

      this.updateLastActivity(
        {
          date: new Date().getTime(),
          channel: channel,
          message: null,
        },
        context,
      );

      localEventBus.publish<ResourceEventsPayload>("channel:created", {
        channel,
        user: context.user,
      });
    }
  }

  /**
   * Called when channel delete has been successfully called
   *
   * @param channel The channel to delete
   * @param result The delete result
   */
  onDeleted(channel: Channel, result: DeleteResult<Channel>): void {
    if (result.deleted) {
      logger.debug("Channel %s has been deleted", channel.id);
    }
  }

  /**
   * Called when a channel as been marked as read.
   * Will publish `channel:read` notification in the message-queue service
   *
   * @param channel
   * @param member
   */
  onRead(channel: Channel, member: ChannelMember): void {
    logger.info(`Channel ${channel.id} as been marked as read for user ${member.id}`);

    gr.platformServices.messageQueue.publish("channel:read", {
      data: {
        channel,
        member,
      },
    });
  }

  /**
   * Called when a channel as been marked as unread.
   * Will publish `channel:unread` notification in the message-queue service
   *
   * @param channel
   * @param member
   */
  onUnread(channel: Channel, member: ChannelMember): void {
    logger.info(`Channel ${channel.id} as been marked as unread for user ${member.id}`);

    gr.platformServices.messageQueue.publish("channel:unread", {
      data: {
        channel,
        member,
      },
    });
  }

  async search(
    pagination: Pagination,
    options: SearchChannelOptions,
    context: ExecutionContext,
  ): Promise<ListResult<Channel>> {
    const rep = gr.platformServices.search.getRepository<Channel>("channel", Channel);
    return rep.search(
      {},
      {
        pagination,
        ...(options.companyId ? { $in: [["company_id", [options.companyId]]] } : {}),
        $text: {
          $search: options.search,
        },
      },
      context,
    );
  }

  async getAllChannelsInWorkspace(
    company_id: string,
    workspace_id: string,
    context?: ExecutionContext,
  ): Promise<Channel[]> {
    let pagination = new Pagination(null, "100");

    const channels: Channel[] = [];
    do {
      const res = await this.channelRepository.find(
        {
          company_id: company_id,
          workspace_id: workspace_id,
        },
        {
          pagination,
        },
        context,
      );
      pagination = new Pagination(res.nextPage.page_token, res.nextPage.limitStr);
      channels.push(...res.getEntities());
    } while (pagination.page_token);

    return channels;
  }

  async completeWithStatistics(
    channels: Pick<ChannelObject, "id" | "company_id" | "workspace_id" | "stats">[],
  ) {
    await Promise.all(
      channels.map(async a => {
        const members = await gr.services.channels.members.getUsersCount({
          ..._.pick(a, "id", "company_id", "workspace_id"),
          counter_type: ChannelUserCounterType.MEMBERS,
        });
        //Fixme: even if it works strange to use "getUsersCount" to get messages count
        const messages = await gr.services.channels.members.getUsersCount({
          ..._.pick(a, "id", "company_id", "workspace_id"),
          counter_type: ChannelUserCounterType.MESSAGES,
        });
        a.stats = { members, messages };
      }),
    );
  }
}
