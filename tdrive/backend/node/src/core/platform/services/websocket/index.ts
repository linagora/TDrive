import { Consumes, ServiceName, TdriveService } from "../../framework";
import WebServerAPI from "../webserver/provider";
import WebSocketAPI from "./provider";
import { WebSocketService } from "./services";
import { AdaptersConfiguration } from "./types";
import FastifyIO from "fastify-socket.io";

@Consumes(["webserver"])
@ServiceName("websocket")
export default class WebSocket extends TdriveService<WebSocketAPI> {
  private service: WebSocketService;
  name = "websocket";
  version = "1";

  api(): WebSocketAPI {
    return this.service;
  }

  async doInit(): Promise<this> {
    const webserver = this.context.getProvider<WebServerAPI>("webserver");
    const fastify = webserver.getServer();

    const options = {
      path: this.configuration.get<string>("path", "/socket"),
    };

    fastify.register(FastifyIO, {
      ...options,
      allowEIO3: true,
      cors: {
        //Allow all origins
        origin: (origin, callback) => callback(null, origin),
        credentials: true,
      },
    });

    this.service = new WebSocketService({
      server: fastify,
      options,
      ready: webserver.onReady.bind(webserver),
      adapters: this.configuration.get<AdaptersConfiguration>("adapters"),
      auth: this.configuration.get<{ secret: string }>("auth.jwt"),
    });

    return this;
  }
}
