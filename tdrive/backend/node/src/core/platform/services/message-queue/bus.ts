import { EventEmitter } from "events";
import { MessageQueueEventBus, MessageQueueEventMessage } from "./api";
const EVENT = Symbol("event");

/**
 * Event bus is used by the MessageQueue decorators to publish data to be send to message-queue service.
 * The message-queue service is the only subscriber of the event bus.
 * By decoupling decorator and service, events will not be published when the service is not enabled.
 */
class EventBus extends EventEmitter implements MessageQueueEventBus {
  constructor() {
    super();
  }

  /**
   * Subscribe is MUST only be used by the message-queue service
   *
   * @param listener
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscribe(listener: (message: MessageQueueEventMessage<any>) => void): this {
    return this.on(EVENT, listener);
  }

  /**
   * Publish must only be used by the MessageQueue decorators
   *
   * @param message
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  publish(message: MessageQueueEventMessage<any>): boolean {
    return this.emit(EVENT, message);
  }
}

export const eventBus = new EventBus();
