import { Initializable, TdriveServiceProvider } from "../../../core/platform/framework";
import { ExecutionContext } from "../../../core/platform/framework/api/crud-service";
import Application from "../entities/application";
import config from "config";

export class ApplicationServiceImpl implements TdriveServiceProvider, Initializable {
  version: "1";

  async init(): Promise<this> {
    return this;
  }

  async get(id: string, _: ExecutionContext): Promise<Application> {
    return (await this.list(_)).find((app: Application) => app?.id === id);
  }

  async list(_: ExecutionContext): Promise<Application[]> {
    return config.get<Application[]>("applications.plugins") || [];
  }
}
