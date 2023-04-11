import { concat, EMPTY, from, Observable } from "rxjs";
import { filter, mergeMap, toArray } from "rxjs/operators";
import Repository from "../../../../../core/platform/services/database/services/orm/repository/repository";
import {
  Channel,
  ChannelMember,
  DefaultChannel,
  DefaultChannelPrimaryKey,
} from "../../../entities";
import {
  CreateResult,
  CrudException,
  DeleteResult,
  ExecutionContext,
  ListResult,
  Paginable,
  SaveResult,
  UpdateResult,
} from "../../../../../core/platform/framework/api/crud-service";
import { ChannelExecutionContext } from "../../../types";
import DefaultChannelListener from "./listener";
import { getLogger } from "../../../../../core/platform/framework";

import { User } from "../../../../../utils/types";
import WorkspaceUser from "../../../../workspaces/entities/workspace_user";
import gr from "../../../../global-resolver";

const logger = getLogger("channel.default");

export default class DefaultChannelServiceImpl {
  version: "1";
  repository: Repository<DefaultChannel>;
  listener: DefaultChannelListener;

  async init(): Promise<this> {
    this.repository = await gr.database.getRepository("default_channels", DefaultChannel);
    this.listener = new DefaultChannelListener(this);
    await this.listener.init();
    return this;
  }

  async create(
    channel: DefaultChannel,
    context: ExecutionContext,
  ): Promise<CreateResult<DefaultChannel>> {
    await this.repository.save(channel, context);

    // Once a default channel has been successfully created, we have to add all the workspace users as member of the channel
    // There are several ways to do it: Directly or using pubsub
    // Since member service is a channel sub service we can do it directly
    // Another good way to be sure that the user is in default channels is to have an endpoint which ensures this...
    this.onCreated(channel);
    return new CreateResult<DefaultChannel>("default_channel", channel);
  }

  get(pk: DefaultChannelPrimaryKey, context: ExecutionContext): Promise<DefaultChannel> {
    return this.repository.findOne(pk, {}, context);
  }

  update(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    pk: DefaultChannelPrimaryKey,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    item: DefaultChannel,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context?: ChannelExecutionContext,
  ): Promise<UpdateResult<DefaultChannel>> {
    throw new Error("Method not implemented.");
  }

  save?<SaveOptions>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    item: DefaultChannel,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: SaveOptions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context?: ChannelExecutionContext,
  ): Promise<SaveResult<DefaultChannel>> {
    throw new Error("Method not implemented.");
  }

  async delete(
    pk: DefaultChannelPrimaryKey,
    context?: ExecutionContext,
  ): Promise<DeleteResult<DefaultChannel>> {
    const defaultChannel = await this.get(pk, context);

    if (!defaultChannel) {
      throw CrudException.notFound("Default channel has not been found");
    }

    await this.repository.remove(defaultChannel, context);

    return new DeleteResult("default_channel", defaultChannel, true);
  }

  list<ListOptions>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    pagination: Paginable,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: ListOptions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    context?: ChannelExecutionContext,
  ): Promise<ListResult<DefaultChannel>> {
    throw new Error("Method not implemented.");
  }

  /**
   * @param channel
   */
  onCreated(channel: DefaultChannel): void {
    logger.debug("Default channel %s: Adding workspace users as members", channel.channel_id);
    const members: ChannelMember[] = [];
    const subscription = this.addWorkspaceUsersToChannel(channel).subscribe({
      next: member => {
        logger.debug(
          "Default Channel %s: User %s has been added: %s",
          channel.channel_id,
          member.user.userId,
          member.added,
        );
        member.added && members.push(member.member);
      },
      error: (err: Error) => {
        logger.error({ err }, "Default Channel %s: Error while adding users", channel.channel_id);
      },
      complete: () => {
        logger.debug(
          "Default Channel %s: Workspace users have been added: %o",
          channel.channel_id,
          members.map(m => m.user_id),
        );
        subscription.unsubscribe();
      },
    });
  }

  addWorkspaceUsersToChannel(
    channel: DefaultChannelPrimaryKey,
  ): Observable<{ user?: WorkspaceUser; member?: ChannelMember; added: boolean; err?: Error }> {
    const workspaceUsers$ = gr.services.workspaces.getAllUsers$({
      workspaceId: channel.workspace_id,
    });

    return workspaceUsers$.pipe(
      // filter out external workspace users
      filter(wsUser => !wsUser.isExternal),
      mergeMap(wsUser =>
        from(
          gr.services.channels.members
            .addUserToChannels({ id: wsUser.userId }, [
              {
                company_id: channel.company_id,
                workspace_id: channel.workspace_id,
                id: channel.channel_id,
              } as Channel,
            ])
            .then(result => ({
              user: wsUser,
              member: result.getEntities()[0].member,
              added: result.getEntities()[0].added,
              err: result.getEntities()[0].err,
            }))
            .catch(err => {
              return { user: wsUser, added: false, err };
            }),
        ),
      ),
    );
  }

  async addUserToDefaultChannels(
    user: User,
    workspace: Required<Pick<DefaultChannelPrimaryKey, "company_id" | "workspace_id">>,
  ): Promise<Array<{ channel: Channel; member?: ChannelMember; err?: Error; added: boolean }>> {
    if (!user || !workspace) {
      throw new Error("Can not add user to default channel (user or workspaces are empty)");
    }

    try {
      const companyUser = await gr.services.companies.getCompanyUser(
        { id: workspace.company_id },
        user,
      );

      if (!companyUser) {
        return [];
      }

      // Do not add guest in default channels
      if (companyUser.role === "guest") {
        logger.debug(
          "CompanyUser role is %s, not added in workspace %s",
          companyUser.role,
          workspace.workspace_id,
        );
        return [];
      }

      const channels = await this.getDefaultChannels({
        company_id: workspace.company_id,
        workspace_id: workspace.workspace_id,
      });

      if (!channels || !channels.length) {
        logger.debug("No default channels in workspace %s", workspace.workspace_id);
        return [];
      }

      logger.info("Adding user %s to channels %s", user, JSON.stringify(channels));

      const regChannels = channels.map(c => ({ id: c.channel_id, ...c } as any as Channel));

      return (
        await gr.services.channels.members.addUserToChannels(user, regChannels)
      ).getEntities();
    } catch (err) {
      logger.error({ err }, "Error while adding user for default channels");
      throw new Error("Error while adding user for default channels");
    }
  }

  getDefaultChannels(
    workspace: Pick<DefaultChannelPrimaryKey, "company_id" | "workspace_id">,
    pagination?: Paginable,
    context?: ExecutionContext,
  ): Promise<DefaultChannel[]> {
    return this.getDefaultChannels$(workspace, pagination, context).pipe(toArray()).toPromise();
  }

  getDefaultChannels$(
    workspace: Pick<DefaultChannelPrimaryKey, "company_id" | "workspace_id">,
    pagination?: Paginable,
    context?: ExecutionContext,
  ): Observable<DefaultChannel> {
    const list = (
      workspace: Pick<DefaultChannelPrimaryKey, "company_id" | "workspace_id">,
      pagination: Paginable,
    ) => {
      return this.repository.find(
        workspace,
        {
          pagination: { limitStr: pagination?.limitStr, page_token: pagination?.page_token },
        },
        context,
      );
    };

    return from(list(workspace, pagination)).pipe(
      mergeMap(channels => {
        const items$ = from(channels.getEntities());
        const next$ = channels?.nextPage?.page_token
          ? this.getDefaultChannels$(workspace, channels.nextPage)
          : EMPTY;

        return concat(items$, next$);
      }),
    );
  }
}
