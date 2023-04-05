import { Prefix, TdriveService } from "../../core/platform/framework";
import WebServerAPI from "../../core/platform/services/webserver/provider";
import web from "./web";
import { WorkspaceServiceImpl } from "./services/workspace";

@Prefix("/internal/services/workspaces/v1")
export default class Service extends TdriveService<WorkspaceServiceImpl> {
  version = "1";
  name = "workspaces";

  public async doInit(): Promise<this> {
    const fastify = this.context.getProvider<WebServerAPI>("webserver").getServer();
    fastify.register((instance, _opts, next) => {
      web(instance, { prefix: this.prefix });
      next();
    });
    return this;
  }

  api(): WorkspaceServiceImpl {
    return null;
  }
}
