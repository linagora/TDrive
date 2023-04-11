import { PushMessageNotification, PushMessageOptions } from "../types";

export interface PushConnector {
  push(
    devices: string[],
    notification: PushMessageNotification,
    options?: PushMessageOptions,
  ): Promise<void>;
}
