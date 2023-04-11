import {
  ChannelMemberNotificationPreference,
  getNotificationPreferenceInstance,
} from "../../../entities";
import { logger } from "../../../../../core/platform/framework";
import { Channel, ChannelMember } from "../../../../channels/entities";
import gr from "../../../../global-resolver";
import { NotificationMessageQueueHandler } from "../../../types";
import { ExecutionContext } from "../../../../../core/platform/framework/api/crud-service";

type JoinChannelMessage = { channel: Channel; member: ChannelMember };

export class JoinChannelMessageProcessor
  implements NotificationMessageQueueHandler<JoinChannelMessage, void>
{
  readonly topics = {
    in: "channel:member:created",
  };

  readonly options = {
    unique: true,
    ack: true,
  };

  readonly name = "JoinChannelMessageProcessor";

  validate(message: JoinChannelMessage): boolean {
    return !!(message && message.channel && message.member);
  }

  async process(message: JoinChannelMessage, context?: ExecutionContext): Promise<void> {
    logger.info(
      `${this.name} - Processing join channel message for user ${message.member.user_id} in channel ${message.channel.id}`,
    );

    try {
      let preference: ChannelMemberNotificationPreference;

      if (Channel.isDirectChannel(message.channel)) {
        // Check if the user already have preference for this channel in case he already joined it before
        preference = await gr.services.notifications.channelPreferences.get(
          {
            company_id: message.member.company_id,
            channel_id: message.member.channel_id,
            user_id: message.member.user_id,
          },
          context,
        );
      }

      if (preference) {
        logger.info(
          `${this.name} - Notification preference already exists for user ${message.member.user_id} in direct channel ${message.channel.id}`,
        );

        return;
      }

      preference = getNotificationPreferenceInstance({
        channel_id: message.member.channel_id,
        company_id: message.member.company_id,
        user_id: message.member.user_id,
        last_read: message.member.last_access || 0,
        preferences: message.member.notification_level,
      });

      await gr.services.notifications.channelPreferences.save(preference, context);

      logger.info(
        `${this.name} - Notification preference has been created for user ${message.member.user_id} in channel ${message.channel.id}`,
      );
    } catch (err) {
      logger.warn(
        { err },
        `${this.name} - Error while creating notification preference from pubsub`,
      );
    }
  }
}
