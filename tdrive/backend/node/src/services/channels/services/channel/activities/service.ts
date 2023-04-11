import { getLogger, Initializable } from "../../../../../core/platform/framework";
import { localEventBus } from "../../../../../core/platform/framework/event-bus";
import { Channel as ChannelEntity, ChannelMember } from "../../../entities/";
import { ResourceEventsPayload } from "../../../../../utils/types";
import { ActivityObjectType, ActivityPublishedType } from "./types";
import _, { sortBy } from "lodash";
import { MessageQueueServiceAPI } from "../../../../../core/platform/services/message-queue/api";
import { ChannelParameters } from "../../../web/types";
import { ChannelVisibility } from "../../../types";

const logger = getLogger("channel.activities");
export default class Activities implements Initializable {
  messageQueue: MessageQueueServiceAPI;

  async init(): Promise<this> {
    const channelConnectorCreatedEvent = "channel:connector:created";
    const channelConnectorDeletedEvent = "channel:connector:deleted";
    const channelMemberCreatedEvent = "channel:member:created";
    const channelMemberDeletedEvent = "channel:member:deleted";
    const channelTabCreatedEvent = "channel:tab:created";
    const channelTabDeletedEvent = "channel:tab:deleted";
    const channelUpdatedEvent = "channel:updated";

    localEventBus.subscribe<ResourceEventsPayload>(channelMemberCreatedEvent, data => {
      if (data.channel.visibility === ChannelVisibility.DIRECT) {
        return;
      }
      //Fixme: We don't show activity from user himself,
      // in the future when we aggregate activities then we could keep it,
      // but for now it is polution in the channel
      if ((data.resourcesAfter[0] as ChannelMember).user_id === data.actor.id) {
        return;
      }
      this.notify(
        channelMemberCreatedEvent,
        {
          type: "channel:activity:member:created",
          actor: {
            type: "user",
            id: data.actor.id,
          },
          context: {
            type: "add",
            array: [
              // data.actor.id !== data.member.user_id ? "invite" : "join"
              { type: "member", resource: data.resourcesAfter[0] },
            ],
          },
        },
        data.channel,
      );
    });

    localEventBus.subscribe<ResourceEventsPayload>(channelMemberDeletedEvent, data => {
      if (data.channel.visibility === ChannelVisibility.DIRECT) {
        return;
      }
      //Do not notify when user leave the channel by themselves
      if (data.resourcesBefore[0].id === data.actor.id) {
        return;
      }
      this.notify(
        channelMemberDeletedEvent,
        {
          type: "channel:activity:member:deleted",
          actor: {
            type: "user",
            id: data.actor.id,
          },
          context: {
            type: "remove",
            array: [{ type: "member", resource: data.resourcesBefore[0] }],
          },
        },
        data.channel,
      );
    });

    localEventBus.subscribe<ResourceEventsPayload>(channelUpdatedEvent, data => {
      const interestedChanges = ["channel_group", "name", "description", "visibility", "icon"];
      const channelChanged = !_.isEqual(
        _.pick(data.resourcesBefore[0], interestedChanges),
        _.pick(data.resourcesAfter[0], interestedChanges),
      );

      const connectorsBefore: Partial<ChannelEntity> = _.pick(data.resourcesBefore[0], [
        "connectors",
      ]);

      const connectorsAfter: Partial<ChannelEntity> = _.pick(data.resourcesAfter[0], [
        "connectors",
      ]);

      const isConnectorCreated: boolean =
        connectorsBefore?.connectors.length < connectorsAfter?.connectors.length;

      const channelConnectorsChanged = !_.isEqual(
        { connectors: sortBy(connectorsBefore.connectors) },
        { connectors: sortBy(connectorsAfter.connectors) },
      );

      if (channelConnectorsChanged) {
        return localEventBus.publish(
          isConnectorCreated ? "channel:connector:created" : "channel:connector:deleted",
          data,
        );
      }

      if (channelChanged) {
        return this.notify(
          channelUpdatedEvent,
          {
            type: "channel:activity:updated",
            actor: {
              type: "user",
              id: data.actor.id,
            },
            context: {
              type: "diff",
              previous: { type: "channel", resource: data.resourcesBefore[0] },
              next: { type: "channel", resource: data.resourcesAfter[0] },
            },
          },
          data.channel,
        );
      }
    });

    localEventBus.subscribe<ResourceEventsPayload>(channelTabCreatedEvent, data =>
      this.notify(
        channelTabCreatedEvent,
        {
          type: "channel:activity:tab:created",
          actor: {
            type: "user",
            id: data.actor.id,
          },
          context: {
            type: "add",
            array: [{ type: "tab", resource: data.resourcesAfter[0] }],
          },
        },
        data.channelParameters,
      ),
    );

    localEventBus.subscribe<ResourceEventsPayload>(channelTabDeletedEvent, data =>
      this.notify(
        channelTabDeletedEvent,
        {
          type: "channel:activity:tab:deleted",
          actor: {
            type: "user",
            id: data.actor.id,
          },
          context: {
            type: "remove",
            array: [{ type: "tab", resource: data.resourcesAfter[0] }],
          },
        },
        data.channelParameters,
      ),
    );

    localEventBus.subscribe<ResourceEventsPayload>(channelConnectorCreatedEvent, data => {
      return this.notify(
        channelConnectorCreatedEvent,
        {
          type: "channel:activity:connector:created",
          actor: {
            type: "user",
            id: data.actor.id,
          },
          context: {
            type: "add",
            array: [{ type: "connector", resource: data.resourcesAfter[0] }],
          },
        },
        data.channel,
      );
    });

    localEventBus.subscribe<ResourceEventsPayload>(channelConnectorDeletedEvent, data => {
      this.notify(
        channelConnectorDeletedEvent,
        {
          type: "channel:activity:connector:deleted",
          actor: {
            type: "user",
            id: data.actor.id,
          },
          context: {
            type: "remove",
            array: [{ type: "connector", resource: data.resourcesBefore[0] }],
          },
        },
        data.channel,
      );
    });

    return this;
  }

  async notify(
    event: string,
    data: ActivityObjectType,
    channel: ChannelEntity | ChannelParameters,
  ): Promise<void> {
    logger.debug(`Activities - New ${event} event %o`, data);
    try {
      await this.messageQueue.publish<ActivityPublishedType>("channel:activity_message", {
        data: {
          channel_id: channel.id,
          workspace_id: channel.workspace_id,
          company_id: channel.company_id,
          activity: data,
        },
      });
    } catch (err) {
      logger.warn({ err }, `Activities - Error while publishing to ${event}`);
    }
  }
}
