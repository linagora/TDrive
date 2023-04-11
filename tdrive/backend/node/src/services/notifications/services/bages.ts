/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Initializable,
  RealtimeDeleted,
  RealtimeSaved,
  TdriveContext,
  TdriveServiceProvider,
} from "../../../core/platform/framework";
import { ResourcePath } from "../../../core/platform/services/realtime/types";
import {
  CrudException,
  DeleteResult,
  ExecutionContext,
  ListResult,
  OperationType,
  Pagination,
  SaveResult,
} from "../../../core/platform/framework/api/crud-service";
import {
  getUserNotificationBadgeInstance,
  UserNotificationBadge,
  UserNotificationBadgePrimaryKey,
  UserNotificationBadgeType,
} from "../entities";
import { NotificationExecutionContext } from "../types";
import { getNotificationRoomName } from "./realtime";
import Repository from "../../../core/platform/services/database/services/orm/repository/repository";
import gr from "../../global-resolver";
import _, { pick, uniq } from "lodash";

export class UserNotificationBadgeService implements TdriveServiceProvider, Initializable {
  version: "1";
  repository: Repository<UserNotificationBadge>;

  async init(context: TdriveContext): Promise<this> {
    this.repository = await gr.database.getRepository<UserNotificationBadge>(
      UserNotificationBadgeType,
      UserNotificationBadge,
    );

    return this;
  }

  async get(
    pk: UserNotificationBadgePrimaryKey,
    context: ExecutionContext,
  ): Promise<UserNotificationBadge> {
    return await this.repository.findOne(pk, {}, context);
  }

  @RealtimeSaved<UserNotificationBadge>((badge, context) => {
    return [
      {
        room: ResourcePath.get(getNotificationRoomName(badge.user_id)),
      },
    ];
  })
  async save<SaveOptions>(
    badge: UserNotificationBadge,
    context: ExecutionContext,
  ): Promise<SaveResult<UserNotificationBadge>> {
    //Initiate the digest
    await gr.services.notifications.digest.putBadge(badge);

    await this.repository.save(getUserNotificationBadgeInstance(badge), context);
    return new SaveResult(UserNotificationBadgeType, badge, OperationType.CREATE);
  }

  @RealtimeDeleted<UserNotificationBadge>((badge, context) => {
    return [
      {
        room: ResourcePath.get(getNotificationRoomName(badge.user_id)),
      },
    ];
  })
  async delete(
    pk: UserNotificationBadgePrimaryKey,
    context?: NotificationExecutionContext,
  ): Promise<DeleteResult<UserNotificationBadge>> {
    //Cancel the current digest as we just read the badges
    await gr.services.notifications.digest.cancelDigest(pk.company_id, pk.user_id);

    await this.repository.remove(pk as UserNotificationBadge, context);
    return new DeleteResult(UserNotificationBadgeType, pk as UserNotificationBadge, true);
  }

  list(): Promise<ListResult<UserNotificationBadge>> {
    throw new Error("Not implemented");
  }

  async listForUserPerCompanies(
    user_id: string,
    context: ExecutionContext,
  ): Promise<ListResult<UserNotificationBadge>> {
    //We remove all badge from current company as next block will create dupicates
    const companies_ids = (await gr.services.companies.getAllForUser(user_id)).map(
      gu => gu.group_id,
    );

    let result: UserNotificationBadge[] = [];
    let type = "";
    for (const company_id of companies_ids) {
      const find = await this.repository.find(
        {
          company_id,
          user_id,
        },
        {
          pagination: new Pagination("", "1"),
        },
        context,
      );
      type = find.type;
      result = result.concat(find.getEntities());
    }

    const badges = new ListResult(type, result);
    await this.ensureBadgesAreReachable(badges, context);

    return badges;
  }

  async listForUser(
    company_id: string,
    user_id: string,
    filter: Pick<UserNotificationBadgePrimaryKey, "workspace_id" | "channel_id" | "thread_id">,
    context?: ExecutionContext,
  ): Promise<ListResult<UserNotificationBadge>> {
    if (!company_id || !user_id) {
      throw CrudException.badRequest("company_id and user_id are required");
    }

    //Cancel the current digest as we just read the badges
    await gr.services.notifications.digest.cancelDigest(company_id, user_id);

    const badges = await this.repository.find(
      {
        ...{
          company_id,
          user_id,
        },
        ...pick(filter, ["workspace_id", "channel_id", "thread_id"]),
      },
      {},
      context,
    );

    await this.ensureBadgesAreReachable(badges, context);

    return badges;
  }

  // This will ensure we are still in the channels and if not, we'll remove the badge
  // We need to also ensure more than that
  // - Are we in the workspace?
  // - Are we in the company?
  async ensureBadgesAreReachable(
    badges: ListResult<UserNotificationBadge>,
    context?: ExecutionContext,
  ): Promise<ListResult<UserNotificationBadge>> {
    if (badges.getEntities().length === 0) {
      return badges;
    }

    const userId = badges.getEntities()[0].user_id;

    const channels = uniq(badges.getEntities().map(r => r.channel_id));
    for (const channelId of channels) {
      const someBadge = badges.getEntities().find(b => b.channel_id === channelId);
      const channelMemberPk = {
        company_id: someBadge.company_id,
        workspace_id: someBadge.workspace_id,
        channel_id: channelId,
        user_id: userId,
      };
      const context = {
        user: { id: channelMemberPk.user_id, server_request: true },
        channel: { id: channelId, ...channelMemberPk },
      };
      const exists =
        (await gr.services.channels.channels.get(
          {
            id: channelId,
            ..._.pick(channelMemberPk, "company_id", "workspace_id"),
          },
          context,
        )) && (await gr.services.channels.members.get(channelMemberPk, context));
      if (!exists) {
        for (const badge of badges.getEntities()) {
          if (badge.channel_id === channelId) this.removeUserChannelBadges(badge, context);
        }
        badges.filterEntities(b => b.channel_id !== channelId);
      }
    }

    const badgePerWorkspace = _.uniqBy(badges.getEntities(), r => r.workspace_id);
    for (const badge of badgePerWorkspace) {
      const workspaceId = badge.workspace_id;
      const companyId = badge.company_id;
      if (!workspaceId || workspaceId === "direct") {
        continue;
      }
      try {
        const exists =
          (await gr.services.workspaces.get({
            id: workspaceId,
            company_id: companyId,
          })) &&
          (await gr.services.workspaces.getUser({
            workspaceId,
            userId,
          }));
        if (!exists) {
          await gr.services.channels.members.ensureUserNotInWorkspaceIsNotInChannel(
            { id: userId },
            { id: workspaceId, company_id: companyId },
            context,
          );
          for (const badge of badges.getEntities()) {
            if (badge.workspace_id === workspaceId) this.removeUserChannelBadges(badge, context);
          }
          badges.filterEntities(b => b.workspace_id !== workspaceId);
        }
      } catch (e) {}
    }

    return badges;
  }

  /**
   * FIXME: This is a temporary implementation which is sending as many websocket notifications as there are badges to remove
   * A better implementation will be to do a bulk delete and have a single websocket notification event
   * @param filter
   * @param context
   */
  async removeUserChannelBadges(
    filter: Pick<
      UserNotificationBadgePrimaryKey,
      "workspace_id" | "company_id" | "channel_id" | "user_id"
    >,
    context?: ExecutionContext,
  ): Promise<number> {
    const badges = (
      await this.repository.find(
        _.pick(filter, ["workspace_id", "company_id", "channel_id", "user_id"]),
        {},
        context,
      )
    ).getEntities();

    return (
      await Promise.all(
        badges.map(async badge => {
          try {
            return (await this.delete(badge)).deleted;
          } catch (err) {}
        }),
      )
    ).filter(Boolean).length;
  }
}
