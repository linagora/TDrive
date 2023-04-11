import { logger } from "../../../core/platform/framework";
import { MessageQueueServiceAPI } from "../../../core/platform/services/message-queue/api";
import { Notifier } from ".";

const TOPIC = "notification:push:mobile";

export class MobilePushNotifier implements Notifier {
  private static instance: MobilePushNotifier;

  static get(messageQueue: MessageQueueServiceAPI): Notifier {
    if (!MobilePushNotifier.instance) {
      MobilePushNotifier.instance = new MobilePushNotifier(messageQueue);
    }

    return MobilePushNotifier.instance;
  }

  private constructor(private messageQueue: MessageQueueServiceAPI) {}

  async notify<Message>(user: string, message: Message): Promise<void> {
    logger.info(`MobilePushNotifier - Push to mobile ${user}`);
    logger.debug(`MobilePushNotifier - Push to mobile ${user}, ${JSON.stringify(message)}`);

    try {
      await this.messageQueue.publish<Message>(TOPIC, {
        data: message,
      });
    } catch (err) {
      logger.warn({ err }, `MobilePushNotifier - Error while sending notification to user ${user}`);
    }
  }
}
