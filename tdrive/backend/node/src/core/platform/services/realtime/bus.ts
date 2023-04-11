/**
 * EventBus is used internally to exchange events between decorators and realtime manager
 */
import { EventEmitter } from "events";
import { RealtimeEventBus } from "./api";
import { RealtimeEntityEvent } from "./types";

class WebsocketEventBus extends EventEmitter implements RealtimeEventBus {
  constructor() {
    super();
  }

  subscribe<Entity>(topic: string, listener: (event: RealtimeEntityEvent<Entity>) => void): this {
    return this.on(topic, listener);
  }

  publish<Entity>(topic: string, event: RealtimeEntityEvent<Entity>): boolean {
    return this.emit(topic, event);
  }
}

export const websocketEventBus = new WebsocketEventBus();
