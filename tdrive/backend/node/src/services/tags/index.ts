import WebServerAPI from "../../core/platform/services/webserver/provider";
import { Prefix, TdriveService } from "../../core/platform/framework";
import web from "./web";

@Prefix("/internal/services/tags/v1")
export default class TagsService extends TdriveService<undefined> {
  version = "1";
  name = "tags";

  public doInit: () => Promise<this> = async () => {
    const fastify = this.context.getProvider<WebServerAPI>("webserver").getServer();
    fastify.register((instance, _opts, next) => {
      web(instance, { prefix: this.prefix });
      next();
    });
    return this;
  };

  // TODO: remove
  api(): undefined {
    return undefined;
  }
}
