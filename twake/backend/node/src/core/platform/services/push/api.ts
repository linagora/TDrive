import { TdriveServiceProvider } from "../../framework";
import { PushMessageNotification, PushMessageOptions } from "./types";

export interface PushServiceAPI extends TdriveServiceProvider {
  push(
    devices: string[],
    notification: PushMessageNotification,
    options?: PushMessageOptions,
  ): Promise<void>;
}
