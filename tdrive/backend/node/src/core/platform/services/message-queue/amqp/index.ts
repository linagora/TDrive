import { Subscription } from "rxjs";
import { logger as rootLogger } from "../../../framework/logger";
import {
  MessageQueueAdapter,
  MessageQueueClient,
  MessageQueueListener,
  MessageQueueMessage,
  MessageQueueSubscriptionOptions,
} from "../api";
import MessageQueueProxy from "../proxy";
import { AMQPMessageQueueManager } from "./manager";
import { SkipCLI } from "../../../framework/decorators/skip";

const logger = rootLogger.child({
  component: "tdrive.core.platform.services.message-queue.amqp",
});

export class AMQPMessageQueueService implements MessageQueueAdapter {
  version: "1";
  clientProxy: MessageQueueProxy;
  availableSubscription: Subscription;
  unavailableSubscription: Subscription;
  manager: AMQPMessageQueueManager;
  type: "amqp";

  constructor(private urls: string[]) {
    this.manager = new AMQPMessageQueueManager();
    this.clientProxy = new MessageQueueProxy();
  }

  @SkipCLI()
  async init(): Promise<this> {
    logger.info("Initializing message-queue service implementation with urls %o", this.urls);
    await this.manager.createClient(this.urls);

    this.availableSubscription = this.manager.getClientAvailable().subscribe({
      next: (client: MessageQueueClient) => {
        logger.info("A new message-queue client is available");
        this.clientProxy.setClient(client);
      },
      error: () => {
        logger.error("Error while listening to message-queue client availability");
      },
    });

    this.unavailableSubscription = this.manager.getClientUnavailable().subscribe({
      next: (err: Error) => {
        logger.warn({ err }, "Client is not available anymore");
        this.clientProxy.unsetClient();
      },
      error: () => {
        logger.error("Error while listening to message-queue client unavailability");
      },
    });

    return this;
  }

  async stop(): Promise<MessageQueueAdapter> {
    logger.info("Closing message-queue service");
    await this.clientProxy.close();
    return this;
  }

  publish<T>(topic: string, message: MessageQueueMessage<T>): Promise<void> {
    return this.clientProxy.publish(topic, message);
  }

  subscribe<T>(
    topic: string,
    listener: MessageQueueListener<T>,
    options?: MessageQueueSubscriptionOptions,
  ): Promise<void> {
    return this.clientProxy.subscribe(topic, listener, options);
  }
}
