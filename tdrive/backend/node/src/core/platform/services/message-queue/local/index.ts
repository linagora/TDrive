import { Subject } from "rxjs";
import { logger as rootLogger } from "../../../framework/logger";
import {
  IncomingMessageQueueMessage,
  MessageQueueAdapter,
  MessageQueueListener,
  MessageQueueMessage,
  MessageQueueSubscriptionOptions,
} from "../api";
import MessageQueueProxy from "../proxy";

const logger = rootLogger.child({
  component: "tdrive.core.platform.services.message-queue.local",
});

/**
 * A message-queue service implementation based on RXJS.
 */
export class LocalMessageQueueService implements MessageQueueAdapter {
  private subjects: Map<string, Subject<IncomingMessageQueueMessage<unknown>>>;
  private clientProxy: MessageQueueProxy;
  type: "local";

  constructor() {
    this.subjects = new Map<string, Subject<IncomingMessageQueueMessage<unknown>>>();
    this.clientProxy = new MessageQueueProxy();
  }

  async init(): Promise<MessageQueueAdapter> {
    this.clientProxy.setClient({
      publish: async <T>(topic: string, message: MessageQueueMessage<T>): Promise<void> => {
        return this.doPublish(topic, message);
      },
      subscribe: async <T>(topic: string, listener: MessageQueueListener<T>): Promise<void> => {
        return this.doSubscribe(topic, listener);
      },
      async close(): Promise<void> {
        logger.info("Closing the local message-queue");
        return this;
      },
    });

    return this;
  }

  async stop(): Promise<MessageQueueAdapter> {
    logger.info("Closing message-queue service");
    await this.clientProxy.close();
    return this;
  }

  async subscribe<T>(topic: string, listener: MessageQueueListener<T>): Promise<void> {
    return this.clientProxy.subscribe(topic, listener);
  }

  async publish<T>(topic: string, message: MessageQueueMessage<T>): Promise<void> {
    return this.clientProxy.publish(topic, message);
  }

  private async doSubscribe<T>(
    topic: string,
    listener: MessageQueueListener<T>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options?: MessageQueueSubscriptionOptions,
  ): Promise<void> {
    if (!this.subjects.has(topic)) {
      this.subjects.set(topic, new Subject<IncomingMessageQueueMessage<T>>());
    }

    this.subjects.get(topic).subscribe({
      next: (value: IncomingMessageQueueMessage<T>) => {
        logger.debug("Got a new value to dispatch to topic '%s': %o", topic, value);
        try {
          listener(value);
        } catch (err) {
          logger.warn({ err }, "Error while calling listener");
        }
      },
    });
  }

  private async doPublish<T>(topic: string, message: MessageQueueMessage<T>): Promise<void> {
    if (!this.subjects.has(topic)) {
      return;
    }

    logger.debug("Publish new value to topic '%s': %o", topic, message);
    this.subjects.get(topic)?.next({
      ...message,
      ...{
        ack: () => {
          logger.debug("ACK message %o", message);
        },
      },
    });
  }
}
