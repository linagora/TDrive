import { Prefix, TdriveService } from "../../core/platform/framework";
import WebServerAPI from "../../core/platform/services/webserver/provider";
import web from "./web";

@Prefix("/internal/services/notifications/v1")
export default class NotificationService extends TdriveService<undefined> {
  version = "1";
  name = "notifications";

  public async doInit(): Promise<this> {
    const fastify = this.context.getProvider<WebServerAPI>("webserver").getServer();
    fastify.register((instance, _opts, next) => {
      web(instance, { prefix: this.prefix });
      next();
    });
    return this;
  }
  // TODO: remove
  api(): undefined {
    return undefined;
  }
}
