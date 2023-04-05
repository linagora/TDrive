import { TdriveService, logger, ServiceName } from "../../framework";
import { PushServiceAPI } from "./api";
import { PushConnector } from "./connectors/connector";
import FcmPushConnector from "./connectors/fcm/service";
import { PushConfiguration, PushMessageNotification, PushMessageOptions } from "./types";

@ServiceName("push")
export default class Push extends TdriveService<PushServiceAPI> {
  version = "1";
  name = "push";
  service: PushConnector;

  public async doInit(): Promise<this> {
    const configuration = this.configuration.get<PushConfiguration>();
    if (configuration.type === "fcm") {
      logger.info(`${this.name} - Use fcm connector`);
      this.service = new FcmPushConnector(configuration.fcm);
    } else {
      logger.info(`${this.name} - Disabled`);
    }
    return this;
  }

  async push(
    devices: string[],
    notification: PushMessageNotification,
    options: PushMessageOptions,
  ): Promise<void> {
    if (!this.service) {
      return;
    }
    if (!devices || devices.length === 0) {
      return;
    }
    return this.service.push(devices, notification, options);
  }

  api(): PushServiceAPI {
    return this;
  }
}
