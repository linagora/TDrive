import Application from "../entities/application";
import Repository from "../../../core/platform/services/database/services/orm/repository/repository";
import {
  Initializable,
  logger as log,
  TwakeServiceProvider,
} from "../../../core/platform/framework";
import { CrudException, ExecutionContext } from "../../../core/platform/framework/api/crud-service";
import SearchRepository from "../../../core/platform/services/search/repository";
import axios from "axios";
import * as crypto from "crypto";
import { isObject } from "lodash";
import gr from "../../global-resolver";

export class ApplicationHooksService implements TwakeServiceProvider, Initializable {
  version: "1";
  repository: Repository<Application>;
  searchRepository: SearchRepository<Application>;

  async init() {
    return this;
  }

  async notifyApp(
    application_id: string,
    connection_id: string,
    user_id: string,
    type: string,
    name: string,
    content: any,
    company_id: string,
    workspace_id: string,
    context: ExecutionContext,
  ): Promise<void> {
    const app = await gr.services.applications.marketplaceApps.get({ id: application_id }, context);
    if (!app) {
      throw CrudException.notFound("Application not found");
    }

    if (!app.api.hooks_url) {
      throw CrudException.badRequest("Application hooks_url is not defined");
    }

    const payload = {
      type,
      name,
      content,
      connection_id: connection_id,
      user_id: user_id,
      company_id,
      workspace_id,
    };

    const signature = crypto
      .createHmac("sha256", app.api.private_key)
      .update(JSON.stringify(payload))
      .digest("hex");

    return await axios
      .post(app.api.hooks_url, payload, {
        headers: {
          "Content-Type": "application/json",
          "X-Twake-Signature": signature,
        },
      })

      .then(({ data }) => data)
      .catch(e => {
        log.error(e.message);
        const r = e.response;

        if (!r) {
          throw CrudException.badGateway("Can't connect remote application");
        }

        let msg = r.data;

        if (isObject(msg)) {
          // parse typical responses
          if (r.data.message) {
            msg = r.data.message;
          } else if (r.data.error) {
            msg = r.data.error;
          } else {
            msg = JSON.stringify(r.data);
          }
        }

        if (r.status == 403) {
          throw CrudException.forbidden(msg);
        } else {
          throw CrudException.badRequest(msg);
        }
      });
  }
}
