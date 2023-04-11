import { logger } from "../../../../../core/platform/framework";
import {
  NotificationMessageQueueHandler,
  PushNotificationMessage,
  PushNotificationMessageResult,
} from "../../../types";
import gr from "../../../../global-resolver";

/**
 * Push new message notification to a set of users
 */
export class PushNotificationMessageProcessor
  implements
    NotificationMessageQueueHandler<PushNotificationMessage, PushNotificationMessageResult>
{
  readonly topics = {
    in: "notification:push:mobile",
  };

  readonly options = {
    unique: true,
    ack: true,
  };

  name = "PushMobileNotificationProcessor";

  validate(message: PushNotificationMessage): boolean {
    return !!(
      message &&
      message.channel_id &&
      message.company_id &&
      message.workspace_id &&
      message.message_id &&
      message.badge_value &&
      message.user
    );
  }

  async process(message: PushNotificationMessage): Promise<PushNotificationMessageResult> {
    logger.info(
      `${this.name} - Processing mobile push notification for channel ${message.channel_id}`,
    );

    await gr.services.notifications.mobilePush.push(message);

    return message;
  }
}
