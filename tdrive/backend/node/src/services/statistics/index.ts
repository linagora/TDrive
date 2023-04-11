import { TdriveService } from "../../core/platform/framework";

export default class StatisticService extends TdriveService<undefined> {
  version = "1";
  name = "statistics";

  public async doInit(): Promise<this> {
    return this;
  }

  // TODO: remove
  api(): undefined {
    return undefined;
  }
}
