import Segment from "./adapters/segment";
import { Analytics } from "./adapters/types";
import { Consumes, TdriveService, logger } from "../../framework";
import TrackerAPI from "./provider";
import { localEventBus } from "../../framework/event-bus";
import { IdentifyObjectType, TrackedEventType, TrackerConfiguration } from "./types";
import { ResourceEventsPayload } from "../../../../utils/types";
import { md5 } from "../../../../core/crypto";

@Consumes([])
export default class Tracker extends TdriveService<TrackerAPI> implements TrackerAPI {
  name = "tracker";
  version = "1";
  analytics: Analytics;

  async doInit(): Promise<this> {
    localEventBus.subscribe<ResourceEventsPayload>("user:deleted", data => {
      this.remove({ user: data.user });
    });

    const channelListEvent = "channel:list";
    localEventBus.subscribe<ResourceEventsPayload>(channelListEvent, data => {
      logger.debug(`Tracker - New ${channelListEvent} event`);
      this.identify({
        user: data.user,
        traits: {
          email: data.user.email || "",
          company: {
            id: data.company.id,
          },
          companies: [data.company.id],
        },
      });
      this.track(
        {
          user: data.user,
          event: "open_client",
        },
        (err: Error) =>
          err
            ? logger.error({ err }, "Tracker - Error while tracking event", channelListEvent)
            : false,
      );
    });

    const channelCreatedEvent = "channel:created";
    localEventBus.subscribe<ResourceEventsPayload>(channelCreatedEvent, data => {
      logger.debug(`Tracker - New ${channelCreatedEvent} event`);
      this.track(
        {
          user: data.user,
          event: channelCreatedEvent,
          properties: this.getVisibilityObject(data.channel.visibility),
        },
        (err: Error) =>
          err
            ? logger.error({ err }, "Tracker - Error while tracking", channelCreatedEvent)
            : false,
      );
    });

    const channelMemberCreatedEvent = "channel:member:created";
    localEventBus.subscribe<ResourceEventsPayload>(channelMemberCreatedEvent, data => {
      logger.debug(`Tracker - New ${channelMemberCreatedEvent} event`);
      this.track(
        {
          user: data.user,
          event: data.user.id !== data.member.user_id ? "channel:invite" : "channel:join",
          properties: this.getVisibilityObject(data.channel.visibility),
        },
        (err: Error) =>
          err
            ? logger.error({ err }, "Tracker - Error while tracking", channelMemberCreatedEvent)
            : false,
      );
    });

    return this;
  }

  private getVisibilityObject(visibility: string) {
    return {
      is_direct: visibility === "direct" ? true : false,
      is_private: visibility === "private" ? true : false,
      is_public: visibility === "public" ? true : false,
    };
  }

  public async identify(
    identity: IdentifyObjectType,
    callback?: (err: Error) => void,
  ): Promise<void> {
    const analiticsIdentity = {
      userId: identity.user?.allow_tracking
        ? identity.user.identity_provider_id
        : `anonymous-${md5(identity.user.identity_provider_id || "")}`,
      ...identity, //Fixme: right now we use this to send onboarding emails so user is not completely anonymous yet
    };

    const analytics = await this.getAnalytics();

    if (analytics && identity) analytics.identify(analiticsIdentity, callback);
  }

  public async remove(
    identity: IdentifyObjectType,
    callback?: (err: Error) => void,
  ): Promise<void> {
    const userId = identity.user.identity_provider_id;
    if (userId) {
      const analytics = await this.getAnalytics();
      if (analytics && identity) analytics.identify({ userId }, callback);
    }
  }

  public async track(event: TrackedEventType, callback?: (err: Error) => void): Promise<void> {
    if (!event.user) {
      logger.warn(`Tracker - Tried to track event without userId: ${event.event}`);
      return;
    }

    // Fixme: For now we have zero users allowing to track (value false by default and not asked during sign up)
    // As soon as we clearly define a way for users to choose this option we will enable this code again.
    // Right now we need stats to move forward with Tdrive.
    // Note that the user that create the event will be anonymised here
    // if (!event.user?.allow_tracking) return;

    const analytics = await this.getAnalytics();

    if (analytics && event) {
      event.event = `tdrive:${event.event}`;
      analytics.track(
        {
          userId: event.user?.allow_tracking
            ? event.user.identity_provider_id || "no_identity_provider_id"
            : `anonymous-${md5(event.user.identity_provider_id || "")}`,
          ...event,
        },
        callback,
      );
    }
  }

  private async getAnalytics(): Promise<Analytics> {
    const type = this.configuration.get<string>("type");
    if (!type || !type.length) {
      logger.info("Tracker - No tracker type specified");
      return;
    }

    const config = this.configuration.get<TrackerConfiguration>(type);
    if (!config) {
      logger.info("Tracker - No tracker configured for type", type);
      return;
    }

    if (!this.analytics && config.key) {
      this.analytics = new Segment(config.key);
    }

    return this.analytics;
  }

  api(): TrackerAPI {
    return this;
  }
}
