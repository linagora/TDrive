import { Channel, getDefaultChannelInstance } from "../../../entities";
import { getLogger, Initializable } from "../../../../../core/platform/framework";
import { localEventBus } from "../../../../../core/platform/framework/event-bus";
import { ResourceEventsPayload } from "../../../../../utils/types";
import DefaultChannelServiceImpl from "./service";

const logger = getLogger("channel:default:listener");

export default class DefaultChannelListener implements Initializable {
  constructor(private service: DefaultChannelServiceImpl) {}

  async init(): Promise<this> {
    localEventBus.subscribe<ResourceEventsPayload>(
      "channel:created",
      this.onChannelCreated.bind(this),
    );
    localEventBus.subscribe<ResourceEventsPayload>(
      "channel:updated",
      this.onChannelUpdated.bind(this),
    );
    localEventBus.subscribe<ResourceEventsPayload>(
      "channel:deleted",
      this.onChannelDeleted.bind(this),
    );
    return this;
  }

  onChannelDeleted(event: ResourceEventsPayload): void {
    logger.debug("Channel has been deleted %o", event.channel);
    if (!event.channel || !Channel.isDefaultChannel(event.channel)) {
      return;
    }

    this.service
      .delete(
        getDefaultChannelInstance({
          channel_id: event.channel.id,
          company_id: event.channel.company_id,
          workspace_id: event.channel.workspace_id,
        }),
      )
      .catch((err: Error) => {
        logger.error({ err }, "Default channel %id can not be deleted", event.channel.id);
      });
  }

  onChannelUpdated(event: ResourceEventsPayload): void {
    logger.debug("Channel has been updated %o", event.channel);

    if (!event.channel || !event.resourcesBefore || !event.resourcesBefore.length) {
      return;
    }

    const channelUpdatedToDefault =
      !Channel.isDefaultChannel(event.resourcesBefore[0] as Channel) &&
      Channel.isDefaultChannel(event.channel);

    const channelIsNotDefaultAnymore =
      Channel.isDefaultChannel(event.resourcesBefore[0] as Channel) &&
      !Channel.isDefaultChannel(event.channel);

    if (channelUpdatedToDefault) {
      logger.debug("Channel %s has been switched to 'default'", event.channel.id);
      this.service
        .create(
          getDefaultChannelInstance({
            channel_id: event.channel.id,
            company_id: event.channel.company_id,
            workspace_id: event.channel.workspace_id,
          }),
          undefined,
        )
        .catch((err: Error) => {
          logger.error({ err }, "Default channel %id can not be updated", event.channel.id);
        });
    }

    if (channelIsNotDefaultAnymore) {
      logger.debug("Channel %s has been switched to !'default'", event.channel.id);
      this.service
        .delete(
          getDefaultChannelInstance({
            channel_id: event.channel.id,
            company_id: event.channel.company_id,
            workspace_id: event.channel.workspace_id,
          }),
        )
        .catch((err: Error) => {
          logger.error({ err }, "Default channel %id can not be removed", event.channel.id);
        });
    }
  }

  onChannelCreated(event: ResourceEventsPayload): void {
    if (!event.channel || !Channel.isDefaultChannel(event.channel)) {
      return;
    }

    logger.debug("Channel %s has been created with 'default' attribute", event.channel.id);
    this.service
      .create(
        getDefaultChannelInstance({
          channel_id: event.channel.id,
          company_id: event.channel.company_id,
          workspace_id: event.channel.workspace_id,
        }),
        undefined,
      )
      .catch((err: Error) => {
        logger.warn({ err }, "Default channel %id can not be created", event.channel.id);
      });
  }
}
