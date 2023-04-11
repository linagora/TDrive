import { logger } from "../../../framework/logger";
import { constants as CONSTANTS } from "./constants";
import { ConfirmChannel, Replies, Message, Options, ConsumeMessage } from "amqplib";

const LOG_PREFIX = "service.message-queue.amqp.AmqpClient -";

export type AmqpCallbackType = (
  err: Error,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parsedMessage: any,
  originalMessage: ConsumeMessage,
) => void;

export type PublishOptions = {
  /**
   * Published message TTL in ms.
   * Up to the underlying layer to deal with it (if supported) and so to not deliver the message if expired.
   */
  ttl?: number | null;
};

export type SubscribeOptions = {
  /**
   * Message TTL in ms.
   * This value is used (if supported) by the underlying layer to not deliver message to the local subscriber if message expired.
   */
  ttl?: number | null;
};

/**
 * Low level AMQP client using AMQP channel the right way.
 *
 * see http://www.squaremobius.net/amqp.node/ for the amqp documentation
 */
export class AmqpClient {
  protected _subscribeCallbackToConsumerTags: Map<AmqpCallbackType, string[]>;
  protected _connected = false;

  constructor(protected channel: ConfirmChannel) {
    this._subscribeCallbackToConsumerTags = new Map();
  }

  get connected(): boolean {
    return this._connected;
  }

  set connected(value: boolean) {
    this._connected = value;
  }

  async dispose(): Promise<void> {
    logger.info(`${LOG_PREFIX} Closing the connection`);

    try {
      this.channel.close();
    } catch (err) {
      logger.debug({ err }, `${LOG_PREFIX} Can not close the channel (probably already closed)`);
    }
  }

  assertExchange(
    exchange: string,
    type = CONSTANTS.EXCHANGE_TYPES.topic,
  ): Promise<Replies.AssertExchange> {
    logger.debug(`${LOG_PREFIX} Assert exchange ${exchange} of type ${type}`);
    return new Promise((r, e) => this.channel.assertExchange(exchange, type).then(r).catch(e));
  }

  ack(message: Message, allUpTo = false): void {
    logger.debug(`${LOG_PREFIX} Ack message`);
    this.channel.ack(message, allUpTo);
  }

  assertQueue(name: string, options: Options.AssertQueue): Promise<Replies.AssertQueue> {
    logger.debug(`${LOG_PREFIX} Assert queue ${name} with options %o`, options);
    return new Promise((r, e) =>
      this.channel
        .assertQueue(name, options)
        .then(result => {
          logger.debug(`${LOG_PREFIX} Queue created %o`, result);

          return result;
        })
        .then(r)
        .catch(e),
    );
  }

  assertBinding(queue: string, exchange: string, routingPattern?: string): Promise<Replies.Empty> {
    logger.debug(
      `${LOG_PREFIX} Bind queue ${queue} on exchange ${exchange} with pattern ${routingPattern}`,
    );
    return new Promise((r, e) =>
      this.channel.bindQueue(queue, exchange, routingPattern).then(r).catch(e),
    );
  }

  send(exchange: string, data: unknown, routingKey = "", options?: Options.Publish): boolean {
    logger.debug(`${LOG_PREFIX} Publish message to exchange ${exchange} with options %o`, options);
    return this.channel.publish(exchange, routingKey, dataAsBuffer(data), options);
  }

  consume(queue: string, options: Options.Consume, callback: AmqpCallbackType): Promise<void> {
    logger.debug(`${LOG_PREFIX} Consume queue ${queue} with options %o`, options);
    return new Promise((r, e) =>
      this.channel
        .consume(queue, onMessage, options)
        .then(res => this._registerNewConsumerTag(callback, res.consumerTag, queue))
        .then(r)
        .catch(e),
    );

    function onMessage(originalMessage: ConsumeMessage) {
      try {
        const message = JSON.parse(originalMessage.content.toString());
        callback(null, message, originalMessage);
      } catch (err) {
        logger.warn({ err }, `${LOG_PREFIX} Can not parse the incoming message`);
        callback(err, null, originalMessage);
      }
    }
  }

  _registerNewConsumerTag(
    callback: AmqpCallbackType,
    consumerTag: string,
    queueName: string,
  ): void {
    const sameCallbackTags = this._subscribeCallbackToConsumerTags.get(callback) || [];

    sameCallbackTags.push(consumerTag);
    this._subscribeCallbackToConsumerTags.set(callback, sameCallbackTags);

    logger.info(
      `${LOG_PREFIX} A new consumer has been created for queue ${queueName}: ${consumerTag}`,
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dataAsBuffer(data: any): Buffer {
  return Buffer.from(JSON.stringify(data));
}
