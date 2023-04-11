import { EventEmitter } from "events";
import socketIO from "socket.io";
import { TdriveServiceProvider } from "../../framework";
import { User } from "../../../../utils/types";
import { WebsocketUserEvent, WebSocket, WebSocketUser } from "./types";

export default interface WebSocketAPI extends TdriveServiceProvider, EventEmitter {
  getIo(): socketIO.Server;

  isConnected(user: User): boolean;

  onUserConnected(listener: (event: WebsocketUserEvent) => void): this;

  onUserDisconnected(listener: (event: WebsocketUserEvent) => void): this;

  getUser(websocket: WebSocket): WebSocketUser;
}
