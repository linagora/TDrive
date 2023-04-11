import { Subject } from "rxjs";
import { v4 as uuidv4 } from "uuid";
import { Initializable, logger, TdriveServiceProvider } from "../../framework";
import { Processor } from "./processor";
import { ExecutionContext } from "../../framework/api/crud-service";

export type MessageQueueType = "local" | "amqp";

export interface MessageQueueMessage<T> {
  /**
   * Optional message id, mainly used for logs
   */
  id?: string;

  /**
   * The message TTL period in milliseconds
   */
  ttl?: number;

  /**
   * The message payload to process
   */
  data: T;
}

export interface MessageQueueEventMessage<T> extends MessageQueueMessage<T> {
  topic: string;
}

export interface IncomingMessageQueueMessage<T> extends MessageQueueMessage<T> {
  ack: () => void;
}

export type MessageQueueSubscriptionOptions = {
  /**
   * A unique subscription guaranties that there will be only one listener consuming the message on the subscription topic even if many are subscribing to the same topic from several places (not only from the current instance/host).
   * Also, it will guaranties that messages which were published before any subscriber subscribes will be consumed.
   */
  unique?: boolean;

  /**
   * Automatically acknowledge the incoming message when the processing is complete
   */
  ack?: boolean;

  /**
   * Use custom named queue instead of using same name as exchange. Can be useful when we have multiple subsciptions on the same topic.
   */
  queue?: string | null;

  /**
   * Configures the message TTL (in ms) in the underlying messaging system.
   * Negative or undefined means no TTL.
   * Notes:
   * - If supported by the messaging system, messages will not be delivered to the application.
   * - If not supported, this may be up to the subscriber itself to filter messages at the application level based on some timestamp if available.
   */
  ttl?: number | null;
};

export type MessageQueueListener<T> = (message: IncomingMessageQueueMessage<T>) => void;

export interface MessageQueueServiceAPI extends TdriveServiceProvider {
  /**
   * Publish a message to a given topic
   * @param topic The topic to publish the message to
   * @param message The message to publish to the topic
   * @param context
   */
  publish<T>(
    topic: string,
    message: MessageQueueMessage<T>,
    context?: ExecutionContext,
  ): Promise<void>;

  /**
   * Subscribe the a topic. The listener will be called when a new message is published in the topic (this may not be true based on the options parameters).
   * @param topic The topic to subsribe to
   * @param listener The function which will process the message published in the topic
   * @param options The subscription options. If not defined, the subscriber will be called for all messages available in the topic.
   */
  subscribe<T>(
    topic: string,
    listener: MessageQueueListener<T>,
    options?: MessageQueueSubscriptionOptions,
  ): Promise<void>;

  /**
   * The messages processor instance
   */
  processor: Processor;

  stop(): Promise<this>;
  start(): Promise<this>;
}

export type MessageQueueAdapter = Pick<MessageQueueServiceAPI, "publish" | "subscribe"> & {
  type: string;
  init?(): Promise<MessageQueueAdapter>;
  start?(): Promise<MessageQueueAdapter>;
  stop?(): Promise<MessageQueueAdapter>;
};

export type MessageQueueClient = Pick<MessageQueueServiceAPI, "publish" | "subscribe"> & {
  /**
   * Close the client
   */
  close?(): Promise<void>;
};

/**
 * The client manager allows to get notified when a client is available and then becomes unavailable.
 */
export interface MessageQueueClientManager {
  /**
   * Ask for a new client to be created
   */
  createClient(config: string[]): Promise<Subject<MessageQueueClient>>;

  /**
   * Subject when a client is available
   */
  getClientAvailable(): Subject<MessageQueueClient>;

  /**
   * Subject when a client becomes unavailable
   */
  getClientUnavailable(): Subject<Error>;
}

/**
 * Manages the message-queue client adding mechanisms to cache subscriptions and messages to publish.
 */
export interface MessageQueueProxy extends MessageQueueClient {
  /**
   * Set a new client to use replacing any existing one.
   * The new client will reuse all the subscriptions automatically.
   * @param client
   */
  setClient(client: MessageQueueClient): Promise<void>;

  /**
   * Remove the client. This will close any underlying connection but will not remove any subscription.
   */
  unsetClient(): Promise<void>;
}

export interface MessageQueueEventBus {
  /**
   * Subscribes to events
   */
  subscribe<T>(listener: (message: MessageQueueEventMessage<T>) => void): this;

  /**
   * Publish message in event bus
   */
  publish<T>(message: MessageQueueEventMessage<T>): boolean;
}

export abstract class MessageQueueServiceSubscription {
  protected messageQueue: MessageQueueServiceAPI;

  async subscribe(messageQueue: MessageQueueServiceAPI): Promise<void> {
    if (!messageQueue) {
      throw new Error("message-queue service it not defined");
    }
    this.messageQueue = messageQueue;

    return this.doSubscribe();
  }

  abstract doSubscribe(): Promise<void>;
}

export class MessageQueueServiceProcessor<In, Out>
  extends MessageQueueServiceSubscription
  implements Initializable
{
  constructor(
    protected handler: MessageQueueHandler<In, Out>,
    protected messageQueue: MessageQueueServiceAPI,
  ) {
    super();
  }

  async init(): Promise<this> {
    try {
      await this.subscribe(this.messageQueue);
    } catch (err) {
      logger.warn(
        { err },
        `MessageQueueServiceProcessor.handler.${this.handler.name} -  Not able to start handler`,
      );
    }

    return this;
  }

  async stop(): Promise<this> {
    // TODO
    return this;
  }

  async process(message: IncomingMessageQueueMessage<In>): Promise<Out> {
    logger.info(
      `MessageQueueServiceProcessor.handler.${this.handler.name}:${message.id} - Processing message`,
    );
    return this.handler.process(message.data);
  }

  async doSubscribe(): Promise<void> {
    //TODO this is where we do not receive the call

    if (this.handler.topics && this.handler.topics.in) {
      logger.info(
        `MessageQueueServiceProcessor.handler.${this.handler.name} - Subscribing to topic ${this.handler?.topics?.in} with options %o`,
        this.handler.options,
      );
      await this.messageQueue.subscribe(
        this.handler.topics.in,
        this.processMessage.bind(this),
        this.handler.options,
      );
    }
  }

  private async processMessage(message: IncomingMessageQueueMessage<In>): Promise<void> {
    if (!message.id) {
      message.id = uuidv4();
    }

    if (this.handler.validate) {
      const isValid = this.handler.validate(message.data);

      if (!isValid) {
        logger.error(
          `MessageQueueServiceProcessor.handler.${this.handler.name}:${message.id} - Message is invalid`,
        );

        //Validate rabbitmq message, we will not process it again
        if (this.handler?.options?.ack && message?.ack) message?.ack();
        return;
      }
    }

    try {
      const result = await this.process(message);
      if (this.handler?.options?.ack && message?.ack) {
        logger.debug(
          `MessageQueueServiceProcessor.handler.${this.handler.name}:${message.id} - Acknowledging message %o`,
          message,
        );
        message?.ack();
      }

      if (result) {
        await this.sendResult(message, result);
      }
    } catch (error) {
      this.handleError(message, error);

      //Fixme Validate message because we don't have max retry handler
      if (this.handler?.options?.ack && message?.ack) message?.ack();
    }
  }

  private async sendResult(message: IncomingMessageQueueMessage<In>, result: Out): Promise<void> {
    if (!this.handler.topics.out) {
      logger.info(
        `MessageQueueServiceProcessor.handler.${this.handler.name}:${message.id} - Message processing result is skipped`,
      );
      return;
    }

    logger.info(
      `MessageQueueServiceProcessor.handler.${this.handler.name}:${message.id} - Sending processing result to ${this.handler.topics.out}`,
    );

    return this.messageQueue.publish(this.handler.topics.out, {
      id: uuidv4(),
      data: result,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async handleError(message: IncomingMessageQueueMessage<In>, err: any) {
    logger.error(
      { err },
      `MessageQueueServiceProcessor.handler.${this.handler.name}:${message.id} - Error while processing message`,
    );
    if (this.handler.topics.error) {
      this.messageQueue.publish(this.handler.topics.error, {
        data: {
          type: "error",
          id: message.id,
          message: err instanceof Error ? (err as Error).message : String(err),
        },
      });
    }
  }
}

/**
 * A message-queue handler is in charge of processing message from a topic and publishing the processing result to another topic
 */
export interface MessageQueueHandler<InputMessage, OutputMessage> extends Initializable {
  readonly topics: {
    // The topic to subscribe to
    in: string;
    // The topic to push process result to if defined
    out?: string;
    // The topic to push error to. When topic is undefined, do not push the error
    error?: string;
  };

  /**
   * Options subscriber options
   */
  readonly options?: MessageQueueSubscriptionOptions;

  /**
   * The handler name
   */
  readonly name: string;

  /**
   * Validate the input message
   *
   * @param message message to validate
   */
  validate?(message: InputMessage): boolean;

  /**
   * Process the message and potentially produces result which will be published elsewhere
   * @param message
   */
  process(message: InputMessage): Promise<OutputMessage>;
}
