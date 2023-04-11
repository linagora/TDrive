import _ from "lodash";
import { RealtimeDeleted, RealtimeSaved } from "../../../core/platform/framework";
import {
  DeleteResult,
  ExecutionContext,
  ListResult,
  OperationType,
  Pagination,
  SaveResult,
  UpdateResult,
} from "../../../core/platform/framework/api/crud-service";
import { ChannelTab, ChannelTabPrimaryKey } from "../entities";
import { ChannelExecutionContext } from "../types";
import { Channel } from "../../../utils/types";
import { ResourcePath } from "../../../core/platform/services/realtime/types";
import Repository from "../../../core/platform/services/database/services/orm/repository/repository";
import gr from "../../global-resolver";

export class TabServiceImpl {
  version: "1";
  repository: Repository<ChannelTab>;

  async init(): Promise<this> {
    this.repository = await gr.database.getRepository("channel_tabs", ChannelTab);
    return this;
  }

  @RealtimeSaved<ChannelTab>((tab, context) => [
    {
      room: ResourcePath.get(getTabsRealtimeRoom((context as ChannelExecutionContext).channel)),
      path: getTabsRealtimeResourcePath(tab, (context as ChannelExecutionContext).channel),
    },
  ])
  async save<SaveOptions>(
    tab: ChannelTab,
    options: SaveOptions,
    context: ChannelExecutionContext,
  ): Promise<SaveResult<ChannelTab>> {
    const pk = {
      company_id: context.channel.company_id,
      workspace_id: context.channel.workspace_id,
      channel_id: context.channel.id,
      id: tab.id,
    };

    let tabEntity = await this.repository.findOne(pk, {}, context);
    if (!tabEntity || !tab.id) {
      tabEntity = new ChannelTab();
      tabEntity = _.merge(tabEntity, pk);
      tabEntity.owner = context.user.id;
    }

    tabEntity = _.merge(
      tabEntity,
      _.pick(tab, ["name", "configuration", "application_id", "order"]),
    );

    await this.repository.save(tabEntity, context);

    return new SaveResult("channel_tabs", tabEntity, OperationType.CREATE);
  }

  async get(tabPk: ChannelTabPrimaryKey, context: ChannelExecutionContext): Promise<ChannelTab> {
    const pk = {
      company_id: context.channel.company_id,
      workspace_id: context.channel.workspace_id,
      channel_id: context.channel.id,
      id: tabPk.id,
    };
    return await this.repository.findOne(pk, {}, context);
  }

  @RealtimeDeleted<ChannelTab>((tab, context) => [
    {
      room: ResourcePath.get(getTabsRealtimeRoom((context as ChannelExecutionContext).channel)),
      path: getTabsRealtimeResourcePath(tab, (context as ChannelExecutionContext).channel),
    },
  ])
  async delete(
    pk: ChannelTabPrimaryKey,
    context?: ExecutionContext,
  ): Promise<DeleteResult<ChannelTab>> {
    const tabEntity = await this.repository.findOne(pk, {}, context);
    if (tabEntity) {
      await this.repository.remove(tabEntity, context);
    }

    return new DeleteResult("channel_tabs", tabEntity, true);
  }

  async list<ListOptions>(
    pagination: Pagination,
    options: ListOptions,
    context: ChannelExecutionContext,
  ): Promise<ListResult<ChannelTab>> {
    const pk = {
      company_id: context.channel.company_id,
      workspace_id: context.channel.workspace_id,
      channel_id: context.channel.id,
    };
    return await this.repository.find(pk, { pagination }, context);
  }

  onUpdated(
    channel: Channel,
    tab: ChannelTab,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateResult: UpdateResult<ChannelTab>,
  ): void {
    console.log("Tab updated", tab);
  }

  onCreated(
    channel: Channel,
    tab: ChannelTab,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createResult: SaveResult<ChannelTab>,
  ): void {
    console.log("Tab created", tab);
  }

  onDeleted(channel: Channel, tab: ChannelTab): void {
    console.log("Tab deleted", tab);
  }
}

export function getTabsRealtimeRoom(channel: ChannelExecutionContext["channel"]): string {
  return `/companies/${channel.company_id}/workspaces/${channel.workspace_id}/channels/${channel.id}/tabs`;
}

export function getTabsRealtimeResourcePath(
  tab: ChannelTab,
  channel: ChannelExecutionContext["channel"],
): string {
  return `/companies/${channel.company_id}/workspaces/${channel.workspace_id}/channels/${channel.id}/tabs/${tab.id}`;
}
