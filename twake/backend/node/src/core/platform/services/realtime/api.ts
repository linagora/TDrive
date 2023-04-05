import { TdriveServiceProvider } from "../../framework";
import { WebSocketUser, WebSocket } from "../../services/websocket/types";
import RealtimeEntityManager from "./services/entity-manager";
import { RealtimeEntityEvent } from "./types";

export interface RealtimeServiceAPI extends TdriveServiceProvider {
  /**
   * Get the realtime event bus instance
   */
  getBus(): RealtimeEventBus;

  /**
   * Get the room manager
   */
  getRoomManager(): RealtimeRoomManager;

  /**
   * Get the entity manager
   */
  getEntityManager(): RealtimeEntityManager;

  /**
   * Create a token for a room
   */
  sign(items: { room: string }[], userId: string): { room: string; token: string }[];
}

export interface RealtimeRoomManager {
  /**
   * Get the number of connected users in the given room
   * @param room name of the room
   */
  getConnectedUsers(room: string): number;

  /**
   * Add the user to a room
   *
   * @param websocket
   * @param room
   * @param user
   */
  join(websocket: WebSocket, room: string, user: WebSocketUser): void;

  /**
   * Remove the user from a room
   *
   * @param websocket
   * @param room
   * @param user
   */
  leave(websocket: WebSocket, room: string, user: WebSocketUser): void;

  /**
   * Remove a user from all the room he joined
   *
   * @param websocket
   * @param user
   */
  leaveAll(websocket: WebSocket, user: WebSocketUser): void;
}

export interface RealtimeEventBus {
  /**
   * Subscribes to a topic
   *
   * @param topic Topic to subscribe to
   * @param listener Listener to call when event is published in the given topic
   */
  subscribe<Entity>(topic: string, listener: (event: RealtimeEntityEvent<Entity>) => void): this;

  /**
   * Publish event in a topic
   *
   * @param topic Topic to publish event to
   * @param event Event to publish
   */
  publish<Entity>(topic: string, event: RealtimeEntityEvent<Entity>): boolean;
}
