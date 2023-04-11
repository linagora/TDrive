import { logger } from "../../../framework/logger";
import { constants as CONSTANTS } from "./constants";
import { AmqpClient, AmqpCallbackType, PublishOptions, SubscribeOptions } from "./client";
import { Options } from "amqplib";
import _ from "lodash";

const LOG_PREFIX = "service.message-queue.amqp.AmqpMessageQueueClient -";

/**
 * AMQP client abstracting low level channel methods to create a message-queue-like implementation
 */
export class AmqpMessageQueueClient extends AmqpClient {
  publish(topic: string, data: unknown, options?: PublishOptions): Promise<boolean> {
    data = _.cloneDeep(data);

    let publishOptions: Options.Publish;

    logger.debug(`${LOG_PREFIX} Publishing message to topic "${topic}" with options %o`, options);

    if (options?.ttl) {
      publishOptions = {
        expiration: options.ttl,
      };
    }

    return this.assertExchange(topic, CONSTANTS.PUBSUB_EXCHANGE.type).then(() =>
      this.send(topic, data, CONSTANTS.PUBSUB_EXCHANGE.routingKey, publishOptions),
    );
  }

  subscribe(topic: string, options: SubscribeOptions, callback: AmqpCallbackType): Promise<void> {
    const queueOptions: Options.AssertQueue = {
      ...CONSTANTS.SUBSCRIBER.queueOptions,
      ...(options?.ttl ? { messageTtl: options.ttl } : {}),
    };

    return this.assertExchange(topic, CONSTANTS.PUBSUB_EXCHANGE.type)
      .then(() => this.assertQueue(CONSTANTS.SUBSCRIBER.queueName, queueOptions))
      .then(res => this.assertBinding(res.queue, topic).then(() => res))
      .then(res => this.consume(res.queue, CONSTANTS.SUBSCRIBER.consumeOptions, callback));
  }

  /**
   * Creates a new consumer which asserts that it will listen to messages in a durable queue.
   * The durable queue goal is to be able to receive events 'from the past' ie events which has been push to the queue while subscribers were not bound.
   * This is quite useful in case of restart to not miss anything between stop and start.
   * Important: If multiple consumers are connected to the same durable queue, AMQP will deliver message to one and only one consumer with a Round-robin behavior by default.
   *
   * @param {String} exchangeName - The exchange name
   * @param {String} queueName - The queue name
   * @param {Function} callback - The callback to call once there is a message in the queue
   */
  subscribeToDurableQueue(
    exchangeName: string,
    queueName: string,
    options: SubscribeOptions,
    callback: AmqpCallbackType,
  ): Promise<void> {
    const durableQueueOptions: Options.AssertQueue = {
      ...CONSTANTS.SUBSCRIBER.durableQueueOptions,
      ...(options?.ttl ? { messageTtl: options.ttl } : {}),
    };

    logger.debug(
      `${LOG_PREFIX} Subscribing to durable queue ${queueName} with options %o`,
      durableQueueOptions,
    );

    return this.assertExchange(exchangeName, CONSTANTS.PUBSUB_EXCHANGE.type)
      .then(() => this.assertQueue(queueName, durableQueueOptions))
      .then(() => this.assertBinding(queueName, exchangeName))
      .then(() => this.consume(queueName, CONSTANTS.SUBSCRIBER.consumeOptions, callback));
  }

  async unsubscribe(topic: string, callback: AmqpCallbackType): Promise<void> {
    const consumerTags = this._subscribeCallbackToConsumerTags.get(callback);

    if (Array.isArray(consumerTags)) {
      logger.info(`${LOG_PREFIX} About to remove the consumer(s): ${consumerTags}`);

      await Promise.all(consumerTags.map(c => this.channel.cancel(c)));

      return;
    }

    logger.warn(`${LOG_PREFIX} No consumerTag found to unsubscribe a consumer from: ${topic}`);
  }
}
