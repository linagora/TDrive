import { plainToClass } from "class-transformer";
import { FastifyReply, FastifyRequest } from "fastify";
import {
  CrudException,
  ExecutionContext,
  ListResult,
  Pagination,
} from "../../../../core/platform/framework/api/crud-service";
import { CrudController } from "../../../../core/platform/services/webserver/types";
import {
  Channel,
  ChannelMember,
  ChannelPendingEmails,
  ChannelPendingEmailsPrimaryKey,
  ChannelPrimaryKey,
  getChannelPendingEmailsInstance,
  UserChannel,
  UsersIncludedChannel,
} from "../../entities";
import { getWebsocketInformation, getWorkspaceRooms } from "../../services/channel/realtime";
import {
  BaseChannelsParameters,
  ChannelListQueryParameters,
  ChannelParameters,
  ChannelPendingEmailsDeleteQueryParameters,
  ChannelSaveOptions,
  ChannelSearchQueryParameters,
  CreateChannelBody,
  ReadChannelBody,
  UpdateChannelBody,
} from "../types";
import { ChannelExecutionContext, ChannelVisibility, WorkspaceExecutionContext } from "../../types";
import { handleError } from "../../../../utils/handleError";
import {
  ResourceCreateResponse,
  ResourceDeleteResponse,
  ResourceGetResponse,
  ResourceListResponse,
  ResourceUpdateResponse,
} from "../../../../utils/types";
import { getLogger } from "../../../../core/platform/framework/logger";
import _ from "lodash";
import { ChannelMemberObject, ChannelObject } from "../../services/channel/types";
import gr from "../../../global-resolver";
import { checkUserBelongsToCompany } from "../../../../utils/company";

const logger = getLogger("channel.controller");

export class ChannelCrudController
  implements
    CrudController<
      ResourceGetResponse<ChannelObject>,
      ResourceCreateResponse<ChannelObject>,
      ResourceListResponse<ChannelObject>,
      ResourceDeleteResponse
    >
{
  getPrimaryKey(request: FastifyRequest<{ Params: ChannelParameters }>): ChannelPrimaryKey {
    return {
      id: request.params.id,
      company_id: request.params.company_id,
      workspace_id: request.params.workspace_id,
    };
  }

  async get(
    request: FastifyRequest<{ Querystring: ChannelListQueryParameters; Params: ChannelParameters }>,
    _reply: FastifyReply,
  ): Promise<ResourceGetResponse<ChannelObject>> {
    const context = getExecutionContext(request);

    let channel: Channel | UsersIncludedChannel = await gr.services.channels.channels.get(
      this.getPrimaryKey(request),
      context,
    );

    if (!channel) {
      throw CrudException.notFound(`Channel ${request.params.id} not found`);
    }

    if (Channel.isDirectChannel(channel) || Channel.isPrivateChannel(channel)) {
      const isMember = await gr.services.channels.members.getChannelMember(
        request.currentUser,
        channel,
        undefined,
        context,
      );

      if (!isMember && !context.user.application_id && !context.user.server_request) {
        throw CrudException.badRequest("User does not have enough rights to get channel");
      }
    }

    if (request.query.include_users)
      channel = await gr.services.channels.channels.includeUsersInDirectChannel(channel);

    const member = await gr.services.channels.members.get(
      _.assign(new ChannelMember(), {
        channel_id: channel.id,
        workspace_id: channel.workspace_id,
        company_id: channel.company_id,
        user_id: context.user.id,
      }),
      context,
    );

    const channelObject = ChannelObject.mapTo(channel, {
      user_member: ChannelMemberObject.mapTo(member),
    });

    await gr.services.channels.channels.completeWithStatistics([channelObject]);

    return {
      websocket: gr.platformServices.realtime.sign(
        [getWebsocketInformation(channel)],
        context.user.id,
      )[0],
      resource: channelObject,
    };
  }

  async search(
    request: FastifyRequest<{
      Querystring: ChannelSearchQueryParameters;
      Params: { company_id: string };
    }>,
    _reply: FastifyReply,
  ): Promise<ResourceListResponse<Channel>> {
    if (request.query?.q?.length === 0) {
      return this.recent(request);
    }

    const context = getSimpleExecutionContext(request);
    const userId = request.currentUser.id;

    await checkUserBelongsToCompany(request.currentUser.id, request.params.company_id);

    const limit = request.query.limit || 100;

    async function* getNextChannels(): AsyncIterableIterator<Channel> {
      let lastPageToken = null;
      let channels: Channel[] = [];
      let hasMore = true;
      do {
        channels = await gr.services.channels.channels
          .search(
            new Pagination(lastPageToken, limit.toString()),
            {
              search: request.query.q,
              companyId: request.params.company_id,
            },
            context,
          )
          .then((a: ListResult<Channel>) => {
            lastPageToken = a.nextPage.page_token;
            if (!lastPageToken) {
              hasMore = false;
            }
            return a.getEntities();
          });

        if (channels.length) {
          for (const channel of channels) {
            yield channel;
          }
        } else {
          hasMore = false;
        }
      } while (hasMore);
    }

    const channels = [] as (Channel & { user_member: ChannelMemberObject })[];

    for await (const ch of getNextChannels()) {
      const channelMember = await gr.services.channels.members.getChannelMember(
        { id: request.currentUser.id },
        ch,
        50,
        context,
      );

      //If not public channel and not member then ignore
      if (!channelMember && ch.visibility !== "public") continue;

      //If public channel but not in the workspace then ignore
      if (
        !channelMember &&
        !(await gr.services.workspaces.getUser({ workspaceId: ch.workspace_id, userId }))
      )
        continue;

      const chWithUser = await gr.services.channels.channels.includeUsersInDirectChannel(
        ch,
        userId,
      );

      channels.push({ ...chWithUser, user_member: channelMember });
      if (channels.length == limit) {
        break;
      }
    }

    await gr.services.channels.channels.completeWithStatistics(channels as ChannelObject[]);

    return { resources: channels };
  }

  async getForPHP(
    request: FastifyRequest<{ Params: ChannelParameters }>,
    reply: FastifyReply,
  ): Promise<void> {
    const context = getExecutionContext(request);
    const channel = await gr.services.channels.channels.get(this.getPrimaryKey(request), context);

    reply.send(channel);
  }

  async thumbnail(
    request: FastifyRequest<{ Params: ChannelParameters }>,
    response: FastifyReply,
  ): Promise<void> {
    const data = await gr.services.channels.channels.thumbnail(request.params.id);
    const filename = "thumbnail.jpg";

    response.header("Content-disposition", `inline; filename="${filename}"`);
    response.type("image/jpeg");

    response.send(data.file);
  }

  async save(
    request: FastifyRequest<{
      Body: CreateChannelBody;
      Params: ChannelParameters;
      Querystring: { include_users: boolean };
    }>,
    reply: FastifyReply,
  ): Promise<ResourceCreateResponse<ChannelObject>> {
    const entity = plainToClass(Channel, {
      ...request.body.resource,
      ...{
        company_id: request.params.company_id,
        workspace_id: request.params.workspace_id,
      },
    });
    logger.debug("reqId: %s - save - Channel input %o", request.id, entity);

    try {
      const options = {
        members: request.body.options ? request.body.options.members || [] : [],
        addCreatorAsMember: true,
      } as ChannelSaveOptions;

      const context = getExecutionContext(request);
      const channelResult = await gr.services.channels.channels.save(entity, options, context);

      logger.debug("reqId: %s - save - Channel %s created", request.id, channelResult.entity.id);

      const member = await gr.services.channels.members.get(
        _.assign(new ChannelMember(), {
          channel_id: channelResult.entity.id,
          workspace_id: channelResult.entity.workspace_id,
          company_id: channelResult.entity.company_id,
          user_id: context.user.id,
        }),
        context,
      );

      let entityWithUsers: Channel = channelResult.entity;

      if (request.query.include_users)
        entityWithUsers = await gr.services.channels.channels.includeUsersInDirectChannel(
          entityWithUsers,
          context.user.id,
        );

      const resultEntity = {
        ...entityWithUsers,
        ...{ user_member: member },
      } as unknown as UserChannel;

      if (entity) {
        reply.code(201);
      }

      return {
        websocket: gr.platformServices.realtime.sign(
          [getWebsocketInformation(channelResult.entity)],
          context.user.id,
        )[0],
        resource: ChannelObject.mapTo(resultEntity),
      };
    } catch (err) {
      handleError(reply, err);
    }
  }

  async update(
    request: FastifyRequest<{ Body: UpdateChannelBody; Params: ChannelParameters }>,
    reply: FastifyReply,
  ): Promise<ResourceUpdateResponse<ChannelObject>> {
    const entity = plainToClass(Channel, {
      ...request.body.resource,
      ...{
        company_id: request.params.company_id,
        workspace_id: request.params.workspace_id,
        id: request.params.id,
      },
    });

    try {
      const context = getExecutionContext(request);
      const result = await gr.services.channels.channels.save(entity, {}, context);

      if (result.entity) {
        reply.code(201);
      }

      return {
        websocket: gr.platformServices.realtime.sign(
          [getWebsocketInformation(result.entity)],
          context.user.id,
        )[0],
        resource: ChannelObject.mapTo(result.entity),
      };
    } catch (err) {
      handleError(reply, err);
    }
  }

  async list(
    request: FastifyRequest<{
      Querystring: ChannelListQueryParameters;
      Params: BaseChannelsParameters;
    }>,
  ): Promise<ResourceListResponse<ChannelObject>> {
    const context = getExecutionContext(request);

    //Fixme: this slow down the channel get operation. Once we stabilize the workspace:member:added event we can remove this
    if (context.workspace.workspace_id !== ChannelVisibility.DIRECT) {
      await gr.services.channelPendingEmail.proccessPendingEmails(
        {
          user_id: context.user.id,
          ...context.workspace,
        },
        context.workspace,
        context,
      );
    }

    const list = await gr.services.channels.channels.list(
      new Pagination(request.query.page_token, request.query.limit),
      { ...request.query },
      context,
    );

    let entities = [];
    if (request.query.include_users) {
      entities = [];
      for (const e of list.getEntities()) {
        entities.push(
          await gr.services.channels.channels.includeUsersInDirectChannel(e, context.user.id),
        );
      }
    } else {
      entities = list.getEntities();
    }

    const resources = entities.map(a => ChannelObject.mapTo(a));

    await gr.services.channels.channels.completeWithStatistics(resources);

    return {
      ...{
        resources: resources,
      },
      ...(request.query.websockets && {
        websockets: gr.platformServices.realtime.sign(
          getWorkspaceRooms(request.params, request.currentUser),
          request.currentUser.id,
        ),
      }),
      ...(list.page_token && {
        next_page_token: list.page_token,
      }),
    };
  }

  async delete(
    request: FastifyRequest<{ Params: ChannelParameters }>,
    reply: FastifyReply,
  ): Promise<ResourceDeleteResponse> {
    try {
      const deleteResult = await gr.services.channels.channels.delete(
        this.getPrimaryKey(request),
        getExecutionContext(request),
      );

      if (deleteResult.deleted) {
        reply.code(204);

        return {
          status: "success",
        };
      }

      return {
        status: "error",
      };
    } catch (err) {
      handleError(reply, err);
    }
  }

  async updateRead(
    request: FastifyRequest<{ Body: ReadChannelBody; Params: ChannelParameters }>,
    reply: FastifyReply,
  ): Promise<boolean> {
    const read = request.body.value;
    const context = getExecutionContext(request);
    try {
      const result = read
        ? await gr.services.channels.channels.markAsRead(
            this.getPrimaryKey(request),
            request.currentUser,
            context,
          )
        : await gr.services.channels.channels.markAsUnread(
            this.getPrimaryKey(request),
            request.currentUser,
            context,
          );
      return result;
    } catch (err) {
      handleError(reply, err);
    }
  }

  async findPendingEmails(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    request: FastifyRequest<{
      Querystring: ChannelListQueryParameters;
      Params: ChannelPendingEmailsPrimaryKey;
    }>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    reply: FastifyReply,
  ): Promise<ResourceListResponse<ChannelPendingEmails>> {
    const list = await gr.services.channelPendingEmail.list(
      new Pagination(request.query.page_token, request.query.limit),
      { ...request.query },
      getChannelPendingEmailsExecutionContext(request),
    );

    return {
      resources: list.getEntities(),
      ...(request.query.websockets && {
        websockets: gr.platformServices.realtime.sign(
          getWorkspaceRooms(request.params, request.currentUser),
          request.currentUser.id,
        ),
      }),
      ...(list.page_token && {
        next_page_token: list.page_token,
      }),
    };
  }

  async savePendingEmails(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    request: FastifyRequest<{
      Body: { resource: ChannelPendingEmails };
      Params: ChannelPendingEmailsPrimaryKey;
    }>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    reply: FastifyReply,
  ): Promise<ResourceCreateResponse<ChannelPendingEmails>> {
    const context = getSimpleExecutionContext(request);
    const pendingEmail = await gr.services.channelPendingEmail.create(
      getChannelPendingEmailsInstance(request.body.resource),
      context,
    );
    logger.debug("reqId: %s - save - PendingEmails input %o", request.id, pendingEmail.entity);
    return { resource: pendingEmail.entity };
  }

  async deletePendingEmails(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    request: FastifyRequest<{ Params: ChannelPendingEmailsDeleteQueryParameters }>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    reply: FastifyReply,
  ): Promise<ResourceDeleteResponse> {
    const pendingEmail = await gr.services.channelPendingEmail.delete(
      getChannelPendingEmailsInstance({
        channel_id: request.params.channel_id,
        company_id: request.params.company_id,
        workspace_id: request.params.workspace_id,
        email: request.params.email,
      }),
    );

    return { status: pendingEmail.deleted ? "success" : "error" };
  }

  async recent(
    request: FastifyRequest<{
      Querystring: { limit?: string };
      Params: Pick<BaseChannelsParameters, "company_id">;
    }>,
  ): Promise<ResourceListResponse<UsersIncludedChannel>> {
    const companyId = request.params.company_id;
    const userId = request.currentUser.id;

    const context = getSimpleExecutionContext(request);
    const limit = parseInt(request.query.limit) || 100;

    const workspaces = (
      await gr.services.workspaces.getAllForUser({ userId }, { id: companyId })
    ).map(a => a.workspaceId);

    let channels: UserChannel[] = await gr.services.channels.channels
      .getChannelsForUsersInWorkspace(companyId, "direct", userId, undefined, context)
      .then(list => list.getEntities());

    for (const workspaceId of workspaces) {
      const workspaceChannels = await gr.services.channels.channels
        .getChannelsForUsersInWorkspace(companyId, workspaceId, userId, undefined, context)
        .then(list => list.getEntities());
      channels = [...channels, ...workspaceChannels];
    }

    channels = channels.sort(
      (a, b) =>
        (b.last_activity || 0) / 100 +
        (b.user_member.last_access || 0) -
        ((a.user_member.last_access || 0) + (a.last_activity || 0) / 100),
    );
    channels = channels.slice(0, 100);

    if (channels.length < limit) {
      let otherChannels: UserChannel[] = [];
      for (const workspaceId of workspaces) {
        //Include channels we could join in this result
        otherChannels = [
          ...otherChannels,
          ...(
            await gr.services.channels.channels.getAllChannelsInWorkspace(
              companyId,
              workspaceId,
              context,
            )
          ).map(ch => {
            return {
              ...ch,
              user_member: null,
            } as UserChannel;
          }),
        ];
      }

      channels = _.unionBy(channels, otherChannels, "id");
    }

    const userIncludedChannels: UsersIncludedChannel[] = await Promise.all(
      channels.map(channel => {
        return gr.services.channels.channels.includeUsersInDirectChannel(channel, userId);
      }),
    );

    const resources = userIncludedChannels.slice(0, limit).map(r => ChannelObject.mapTo(r, {}));
    await gr.services.channels.channels.completeWithStatistics(resources);

    await new Promise(r => setTimeout(r, 2000));

    return {
      resources,
    };
  }
}

function getExecutionContext(
  request: FastifyRequest<{ Params: BaseChannelsParameters }>,
): WorkspaceExecutionContext {
  return {
    user: request.currentUser,
    url: request.url,
    method: request.routerMethod,
    reqId: request.id,
    transport: "http",
    workspace: {
      company_id: request.params.company_id,
      workspace_id: request.params.workspace_id,
    },
  };
}

function getChannelPendingEmailsExecutionContext(
  request: FastifyRequest<{
    Params: ChannelPendingEmailsPrimaryKey | ChannelPendingEmailsDeleteQueryParameters;
  }>,
): ChannelExecutionContext {
  return {
    user: request.currentUser,
    url: request.url,
    method: request.routerMethod,
    reqId: request.id,
    transport: "http",
    channel: {
      id: request.params.channel_id,
      company_id: request.params.company_id,
      workspace_id: request.params.workspace_id,
    },
  };
}

function getSimpleExecutionContext(request: FastifyRequest): ExecutionContext {
  return {
    user: request.currentUser,
    url: request.url,
    method: request.routerMethod,
    reqId: request.id,
    transport: "http",
  };
}
