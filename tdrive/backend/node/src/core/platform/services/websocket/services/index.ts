import socketIO from "socket.io";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createClient } = require("redis");
import SocketIORedis from "@socket.io/redis-adapter";
import jwt from "jsonwebtoken";
import WebSocketAPI from "../provider";
import {
  WebSocket,
  WebSocketServiceConfiguration,
  WebSocketUser,
  WebsocketUserEvent,
} from "../types";
import { EventEmitter } from "events";
import { User } from "../../../../../utils/types";
import { JwtType } from "../../types";

export class WebSocketService extends EventEmitter implements WebSocketAPI {
  version: "1";
  private io: socketIO.Server;

  constructor(serviceConfiguration: WebSocketServiceConfiguration) {
    super();

    serviceConfiguration.ready(() => {
      this.io = serviceConfiguration.server.io;

      if (serviceConfiguration.adapters?.types?.includes("redis")) {
        const pubClient = createClient(serviceConfiguration.adapters.redis);
        const subClient = pubClient.duplicate();
        this.io.adapter(SocketIORedis.createAdapter(pubClient, subClient));
      }

      this.io.on("connection", socket => {
        socket.on("authenticate", message => {
          if (message.token) {
            jwt.verify(
              message.token as string,
              serviceConfiguration.auth.secret as string,
              (err, decoded) => {
                if (err) {
                  socket.emit("unauthorized", { err });
                  socket.disconnect();
                  return;
                }
                (socket as unknown as WebSocket).decoded_token = decoded as JwtType;
                const user = this.getUser(socket as WebSocket);

                socket.emit("authenticated");

                socket.on("message", message => {
                  this.io.emit("message", message);
                });

                this.emit("user:connected", {
                  user,
                  socket,
                  event: "user:connected",
                } as WebsocketUserEvent);

                socket.on("disconnect", () =>
                  this.emit("user:disconnected", {
                    user,
                    socket,
                    event: "user:disconnected",
                  } as WebsocketUserEvent),
                );
              },
            );
          } else {
            socket.emit("unauthorized", { err: "No token provided" });
            socket.disconnect();
            return;
          }
        });
      });
    });
  }

  onUserConnected(listener: (event: WebsocketUserEvent) => void): this {
    return this.on("user:connected", listener);
  }

  onUserDisconnected(listener: (event: WebsocketUserEvent) => void): this {
    return this.on("user:disconnected", listener);
  }

  getUser(socket: WebSocket): WebSocketUser {
    return {
      id: socket.decoded_token.sub,
      identity_provider_id: socket.decoded_token.provider_id,
      email: socket.decoded_token.email,
      token: socket.decoded_token,
      allow_tracking: socket.decoded_token.track,
    };
  }

  getIo(): socketIO.Server {
    return this.io;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isConnected(user: User): boolean {
    return false;
  }
}
