import config from "config";
import { Prefix, TdriveService } from "../../core/platform/framework";
import WebServerAPI from "../../core/platform/services/webserver/provider";
import Application from "../applications/entities/application";
import web from "./web/index";
import axios, { AxiosResponse } from "axios";

@Prefix("/api")
export default class ApplicationsApiService extends TdriveService<undefined> {
  version = "1";
  name = "applicationsapi";

  public async doInit(): Promise<this> {
    const fastify = this.context.getProvider<WebServerAPI>("webserver").getServer();
    fastify.register((instance, _opts, next) => {
      web(instance, { prefix: this.prefix });
      next();
    });

    //Redirect requests from /plugins/* to the plugin server (if installed)
    const apps = config.get<Application[]>("applications.plugins") || [];
    for (const app of apps) {
      const domain = app.internal_domain.replace(/(\/$|^\/)/gm, "");
      const prefix = app.external_prefix.replace(/(\/$|^\/)/gm, "");
      if (domain && prefix) {
        try {
          fastify.all("/" + prefix + "/*", async (req, rep) => {
            console.log("Proxying", req.method, req.url, "to", domain);
            try {
              const response = await axios.request({
                url: domain + req.url,
                method: req.method as any,
                headers: req.headers as {
                  [key: string]: string;
                },
                data: req.body as any,
              });
              rep.raw.statusCode = response.status;
              rep.raw.end(response.data);
            } catch (err) {
              console.error(err);
              rep.raw.statusCode = 500;
              rep.raw.end("Error");
            }
          });
          console.log("Listening at ", "/" + prefix + "/*");
        } catch (e) {
          console.log(e);
          console.log("Can't listen to ", "/" + prefix + "/*");
        }
      }
    }

    return this;
  }

  // TODO: remove
  api(): undefined {
    return undefined;
  }
}
