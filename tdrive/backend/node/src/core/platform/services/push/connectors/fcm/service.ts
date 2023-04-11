import fetch from "node-fetch";
import { logger } from "../../../../framework";
import { PushConfiguration, PushMessageNotification, PushMessageOptions } from "../../types";
import { PushConnector } from "../connector";

export default class FcmPushConnector implements PushConnector {
  name = "FcmPushConnector";

  constructor(readonly configuration: PushConfiguration["fcm"]) {}

  async push(
    devices: string[],
    notification: PushMessageNotification,
    options: PushMessageOptions,
  ): Promise<void> {
    logger.debug(`${this.name} - Push notification to devices ${JSON.stringify(devices)}`);

    const firebaseEndpoint = this.configuration.endpoint;
    const firebaseApiKey = this.configuration.key;

    const pushMessage = {
      data: {
        notification_data: options.notification_data,
        click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
      notification: { ...notification, click_action: "FLUTTER_NOTIFICATION_CLICK" },
      collapse_key: options.collapse_key,
      registration_ids: [...devices],
    };

    //Push to fcm
    try {
      const response = await fetch(firebaseEndpoint, {
        method: "post",
        body: JSON.stringify(pushMessage),
        headers: {
          "Content-Type": "application/json",
          Authorization: `key=${firebaseApiKey}`,
        },
      });
      if (response.status !== 200) {
        logger.error(`${this.name} - Reply from FCM status code : ${response.status}`);
        logger.error(
          `${this.name} - JSON reply from FCM: ${JSON.stringify(await response.json())}`,
        );
      }
    } catch (e) {
      logger.error(`${this.name} - Error while sending message to FCM`);
      logger.error(e);
    }
  }
}
