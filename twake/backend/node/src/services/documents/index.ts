import { Prefix, TdriveService } from "../../core/platform/framework";
import WebServerAPI from "../../core/platform/services/webserver/provider";
import web from "./web";

@Prefix("/internal/services/documents/v1")
export default class DocumentsService extends TdriveService<undefined> {
  version = "1";
  name = "documents";

  public doInit: () => Promise<this> = async () => {
    const fastify = this.context.getProvider<WebServerAPI>("webserver").getServer();
    fastify.register((instance, _options, next) => {
      web(instance, { prefix: this.prefix });
      next();
    });

    return this;
  };

  api = (): undefined => {
    return undefined;
  };
}
