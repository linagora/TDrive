import _ from "lodash";
import { getLogger, TdriveLogger } from "../../../core/platform/framework";
import { MessageQueueHandler } from "../../../core/platform/services/message-queue/api";
import { websocketEventBus } from "../../../core/platform/services/realtime/bus";
import {
  RealtimeEntityActionType,
  ResourcePath,
} from "../../../core/platform/services/realtime/types";
import { UsersOnlineMessage } from "../api";
import { ONLINE_TOPIC } from "../constants";

export class UserOnlineProcessor implements MessageQueueHandler<UsersOnlineMessage, void> {
  private logger: TdriveLogger;
  readonly topics = {
    in: ONLINE_TOPIC,
  };

  readonly options = {
    unique: false,
    ack: true,
  };

  readonly name = "UserOnlineProcessor";

  constructor() {
    this.logger = getLogger(`online.pubsub.${this.name}`);
  }

  validate(message: UsersOnlineMessage): boolean {
    return !!(message && message.length);
  }

  async process(message: UsersOnlineMessage): Promise<void> {
    this.logger.debug(
      `Pushing user online status for users ${message.map(u => u.user_id).join(",")}`,
    );

    const grouped_data = _.groupBy(message, "company_id");

    Object.values(grouped_data).forEach((messagePerCompany: UsersOnlineMessage) => {
      websocketEventBus.publish(RealtimeEntityActionType.Event, {
        type: "user:online",
        room: ResourcePath.get(`/users/online/${messagePerCompany[0].company_id}`),
        entity: { online: messagePerCompany },
        resourcePath: null,
        result: null,
      });
    });

    return;
  }
}
