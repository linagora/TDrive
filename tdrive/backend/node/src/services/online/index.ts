import { Prefix, TdriveService } from "../../core/platform/framework";

@Prefix("/internal/services/online/v1")
export default class OnlineService extends TdriveService<undefined> {
  version = "1";
  name = "online";

  api(): undefined {
    return undefined;
  }

  public async doInit(): Promise<this> {
    return this;
  }
}
