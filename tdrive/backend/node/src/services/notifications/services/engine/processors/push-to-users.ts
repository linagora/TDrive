import { logger } from "../../../../../core/platform/framework";
import { MobilePushNotifier } from "../../../notifiers";
import {
  MentionNotification,
  MentionNotificationResult,
  NotificationMessageQueueHandler,
  PushNotificationMessage,
} from "../../../types";
import { ChannelMemberNotificationPreference } from "../../../entities";
import { UserNotificationBadge } from "../../../entities";
import _ from "lodash";
import { websocketEventBus } from "../../../../../core/platform/services/realtime/bus";
import {
  RealtimeEntityActionType,
  ResourcePath,
} from "../../../../../core/platform/services/realtime/types";
import { getNotificationRoomName } from "../../realtime";
import gr from "../../../../global-resolver";
import { ExecutionContext } from "../../../../../core/platform/framework/api/crud-service";

/**
 * Push new message notification to a set of users
 */
export class PushNotificationToUsersMessageProcessor
  implements NotificationMessageQueueHandler<MentionNotification, MentionNotificationResult>
{
  readonly topics = {
    in: "notification:mentions",
  };

  readonly options = {
    unique: true,
    ack: true,
  };

  name = "PushNotificationToUsersMessageProcessor";

  validate(message: MentionNotification): boolean {
    return !!(
      message &&
      message.channel_id &&
      message.company_id &&
      message.workspace_id &&
      message.creation_date
    );
  }

  async process(
    message: MentionNotification,
    context?: ExecutionContext,
  ): Promise<MentionNotificationResult> {
    logger.info(`${this.name} - Processing mention notification for channel ${message.channel_id}`);

    if (
      !message.company_id ||
      !message.workspace_id ||
      !message.channel_id ||
      !message.creation_date
    ) {
      throw new Error("Missing required fields");
    }

    if (!message.mentions || !message.mentions.users || !message.mentions.users.length) {
      logger.info(`${this.name} - Message does not have any user to mention`);
      return;
    }

    const usersToUpdate = await this.filterUsersOnLastReadChannelTime(
      { channel_id: message.channel_id, company_id: message.company_id },
      message.mentions.users,
      message.creation_date,
      context,
    );

    if (!usersToUpdate.length) {
      logger.info(`${this.name} - There are no users to notify from the last read channel date`);
      return;
    }

    const badges = await this.addNewMessageBadgesForUsers(
      {
        channel_id: message.channel_id,
        company_id: message.company_id,
        workspace_id: message.workspace_id,
        thread_id: message.thread_id || message.message_id,
        message_id: message.message_id,
      },
      usersToUpdate,
      message.mentions,
      context,
    );

    badges.forEach(badge => {
      const badgeLocation = {
        company_id: message.company_id,
        workspace_id: message.workspace_id,
        channel_id: message.channel_id,
        user: badge.user_id.toString(),
        thread_id: message.thread_id || message.message_id,
        message_id: message.message_id,
      };

      websocketEventBus.publish(RealtimeEntityActionType.Event, {
        type: "notification:desktop",
        room: ResourcePath.get(getNotificationRoomName(badge.user_id)),
        entity: {
          ...badgeLocation,
          title: message.title,
          text: formatNotificationMessage(message),
        },
        resourcePath: null,
        result: null,
      });

      this.sendPushNotification(badge.user_id, {
        ...badgeLocation,
        badge_value: 1,
        title: message.title,
        text: formatNotificationMessage(message),
      });
    });
  }

  async filterUsersOnLastReadChannelTime(
    channel: Pick<ChannelMemberNotificationPreference, "channel_id" | "company_id">,
    users: string[] = [],
    timestamp: number,
    context?: ExecutionContext,
  ): Promise<string[]> {
    if (!users.length) {
      return [];
    }

    return (
      await gr.services.notifications.channelPreferences.getChannelPreferencesForUsers(
        channel,
        users,
        {
          lessThan: timestamp,
        },
        context,
      )
    )
      .getEntities()
      .map((preference: ChannelMemberNotificationPreference) => preference.user_id);
  }

  async addNewMessageBadgesForUsers(
    badge: Pick<
      UserNotificationBadge,
      "channel_id" | "company_id" | "thread_id" | "workspace_id" | "message_id"
    >,
    users: string[] = [],
    mentions: MentionNotification["mentions"],
    context: ExecutionContext,
  ): Promise<Array<UserNotificationBadge>> {
    logger.info(`${this.name} - Update badge for users ${users.join("/")}`);

    return (
      await Promise.all(
        users.map(user => {
          const badgeEntity = new UserNotificationBadge();
          _.assign(badgeEntity, {
            channel_id: badge.channel_id,
            company_id: badge.company_id,
            workspace_id: badge.workspace_id,
            thread_id: badge.thread_id,
            message_id: badge.message_id,
            user_id: user,
            mention_type: mentions.users.includes(user),
          });
          return this.saveBadge(badgeEntity, context);
        }),
      )
    ).filter(Boolean);
  }

  private saveBadge(
    badge: UserNotificationBadge,
    context: ExecutionContext,
  ): Promise<UserNotificationBadge> {
    return gr.services.notifications.badges
      .save(badge, context)
      .then(result => result.entity)
      .catch(err => {
        logger.warn({ err }, `${this.name} - A badge has not been saved for user ${badge.user_id}`);
        return null;
      });
  }

  sendPushNotification(user: string, pushNotification: PushNotificationMessage): void {
    MobilePushNotifier.get(gr.platformServices.messageQueue).notify(user, pushNotification);
  }
}

function formatNotificationMessage(message: MentionNotification): string {
  let text = message.text;
  // Clean the message text to remove @userName:id-id-id
  ((text || "").match(/@[^: ]+:([0-f-]{36})/gm) || []).forEach(match => {
    const string = (match || "").trim();
    const id = string.split(":").pop();
    const fallback = string.split(":").shift();
    text = text.replace(string, message.object_names?.users[id] || fallback);
  });
  // Clean the message text to remove #channelName:id-id-id
  ((text || "").match(/#[^: ]+:([0-f-]{36})/gm) || []).forEach(match => {
    const string = (match || "").trim();
    const id = string.split(":").pop();
    const fallback = string.split(":").shift();
    text = text.replace(string, message.object_names?.channels[id] || fallback);
  });
  return text;
}
