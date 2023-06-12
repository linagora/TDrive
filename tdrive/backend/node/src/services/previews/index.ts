import { Prefix, TdriveService } from "../../core/platform/framework";

@Prefix("/internal/services/previews/v1")
export default class PreviewsService extends TdriveService<undefined> {
  version = "1";
  name = "previews";

  public async doInit(): Promise<this> {
    return this;
  }

  // TODO: remove
  api(): undefined {
    return undefined;
  }
}
