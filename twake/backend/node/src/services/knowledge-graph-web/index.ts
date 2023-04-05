import { Consumes, Prefix, TdriveService } from "../../core/platform/framework";
import WebServerAPI from "../../core/platform/services/webserver/provider";
import web from "./web/index";

@Prefix("/internal/services/knowledge-graph/v1")
@Consumes(["webserver"])
export default class MessageService extends TdriveService<undefined> {
  version = "1";
  name = "knowledge-graph";

  api(): undefined {
    return undefined;
  }

  public async doInit(): Promise<this> {
    const fastify = this.context.getProvider<WebServerAPI>("webserver").getServer();

    fastify.register((instance, _opts, next) => {
      web(instance, { prefix: this.prefix });
      next();
    });

    return this;
  }
}
