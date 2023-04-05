import { MessageQueueAdapter, MessageQueueType } from "./api";
import { AMQPMessageQueueService } from "./amqp";
import { LocalMessageQueueService } from "./local";
import { TdriveServiceConfiguration, logger as rootLogger } from "../../framework";

const logger = rootLogger.child({
  component: "tdrive.core.platform.services.message-queue.factory",
});

const DEFAULT_AMQP_URL = "amqp://guest:guest@localhost:5672";
const DEFAULT_ADAPTER = "amqp";

export class MessageQueueAdapterFactory {
  public create(configuration: TdriveServiceConfiguration): MessageQueueAdapter {
    const type: MessageQueueType = configuration.get<MessageQueueType>("type", DEFAULT_ADAPTER);

    logger.info("Building Adapter %o", type);

    switch (type) {
      case "local":
        return new LocalMessageQueueService();
      case "amqp":
        let urls: string[] = configuration.get<string[]>("amqp.urls", [DEFAULT_AMQP_URL]);

        //For environment variables
        if (typeof urls === "string") {
          urls = (urls as string).split(",");
        }

        return new AMQPMessageQueueService(urls);
      default:
        logger.error("Adapter '%o' is not supported", type);
        throw new Error(`${type} is not supported`);
    }
  }
}

export default new MessageQueueAdapterFactory();
