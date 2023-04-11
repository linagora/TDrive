import socketIO, { Socket } from "socket.io";
import { RedisAdapterOptions } from "@socket.io/redis-adapter";
import { User } from "../../../../utils/types";
import { JwtType } from "../types";
import { FastifyInstance } from "fastify";

export interface AdaptersConfiguration {
  types: Array<string>;
  redis: RedisAdapterOptions;
}

export interface WebSocketServiceConfiguration {
  server: FastifyInstance;
  // eslint-disable-next-line @typescript-eslint/ban-types
  ready: Function;
  options?: socketIO.ServerOptions | { path: string };
  adapters?: AdaptersConfiguration;
  auth?: { secret: string };
}

export interface WebSocketUser extends User {
  token?: DecodedToken;
}

export interface WebSockets {
  [index: string]: WebSocket[];
}

export interface WebSocket extends Socket {
  decoded_token: DecodedToken;
}

export interface WebsocketUserEvent {
  event: string;
  socket: WebSocket;
  user: WebSocketUser;
}

type DecodedToken = JwtType;
