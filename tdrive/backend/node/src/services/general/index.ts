import WebServerAPI from "../../core/platform/services/webserver/provider";
import { Consumes, Prefix, TdriveService } from "../../core/platform/framework";
import { GeneralServiceAPI } from "./api";
import web from "./web/index";
import { ServerConfiguration } from "./types";

@Prefix("/internal/services/general/v1")
@Consumes(["webserver"])
export default class GeneralService extends TdriveService<GeneralServiceAPI> {
  version = "1";
  name = "general";
  service: GeneralServiceAPI;

  api(): GeneralServiceAPI {
    return this.service;
  }

  public async doInit(): Promise<this> {
    const fastify = this.context.getProvider<WebServerAPI>("webserver").getServer();

    const configuration = this.configuration.get<ServerConfiguration["configuration"]>();

    fastify.register((instance, _opts, next) => {
      web(instance, { prefix: this.prefix, configuration: configuration });
      next();
    });

    return this;
  }
}
