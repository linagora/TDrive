import { TdriveService, Consumes, Prefix, ServiceName } from "../../framework";
import web from "./web/index";
import AuthServiceAPI, { JwtConfiguration } from "./provider";
import { AuthService as AuthServiceImpl } from "./service";
import WebServerAPI from "../webserver/provider";

@Prefix("/api/auth")
@Consumes(["webserver"])
@ServiceName("auth")
export default class AuthService extends TdriveService<AuthServiceAPI> {
  name = "auth";
  service: AuthServiceAPI;

  api(): AuthServiceAPI {
    return this.service;
  }

  public async doInit(): Promise<this> {
    this.service = new AuthServiceImpl(this.configuration.get<JwtConfiguration>("jwt"));
    const fastify = this.context.getProvider<WebServerAPI>("webserver").getServer();

    fastify.register((instance, _opts, next) => {
      web(instance, { prefix: this.prefix });
      next();
    });

    return this;
  }
}
