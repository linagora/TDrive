import {
  NotificationMessageQueueHandler,
  PushNotificationMessage,
  ReactionNotification,
} from "../../../types";
import { logger } from "../../../../../core/platform/framework";
import { websocketEventBus } from "../../../../../core/platform/services/realtime/bus";
import {
  RealtimeEntityActionType,
  ResourcePath,
} from "../../../../../core/platform/services/realtime/types";
import { MobilePushNotifier } from "../../../notifiers";
import gr from "../../../../global-resolver";
import { getNotificationRoomName } from "../../realtime";
import { Channel } from "../../../../channels/entities/channel";
import User from "../../../../user/entities/user";
export class PushReactionNotification
  implements NotificationMessageQueueHandler<ReactionNotification, void>
{
  readonly topics = {
    in: "notification:reaction",
  };

  readonly options = {
    unique: true,
    ack: true,
  };

  name = "PushReactionToUsersMessageProcessor";

  validate(message: ReactionNotification): boolean {
    return !!(
      message &&
      message.message_id &&
      message.channel_id &&
      message.company_id &&
      message.workspace_id &&
      message.thread_id &&
      message.user_id &&
      message.reaction &&
      message.creation_date &&
      message.reaction_user_id
    );
  }

  async process(task: ReactionNotification): Promise<void> {
    logger.info(`${this.name} - Processing reaction notification for message ${task.message_id}`);

    const location = {
      company_id: task.company_id,
      workspace_id: task.workspace_id,
      channel_id: task.channel_id,
      user: task.user_id.toString(),
      thread_id: task.thread_id || task.message_id,
      message_id: task.message_id,
    };

    const { title, text } = await this.buildNotificationMessageContent(task);

    websocketEventBus.publish(RealtimeEntityActionType.Event, {
      type: "notification:desktop",
      room: ResourcePath.get(getNotificationRoomName(task.user_id)),
      entity: {
        ...location,
        title,
        text,
      },
      resourcePath: null,
      result: null,
    });

    this.sendPushNotification(task.user_id, {
      ...location,
      title,
      text,
    });
  }

  sendPushNotification(user: string, reaction: PushNotificationMessage): void {
    MobilePushNotifier.get(gr.platformServices.messageQueue).notify(user, reaction);
  }

  async buildNotificationMessageContent(
    message: ReactionNotification,
  ): Promise<{ title: string; text: string }> {
    const { company_id, workspace_id, reaction_user_id, reaction } = message;
    let title = "";

    const channel: Channel = await gr.services.channels.channels.get({
      id: message.channel_id,
      company_id: company_id,
      workspace_id: workspace_id,
    });

    const [company, workspace, user] = await Promise.all([
      gr.services.companies.getCompany({ id: company_id }),
      workspace_id === "direct"
        ? null
        : gr.services.workspaces.get({
            company_id: company_id,
            id: workspace_id,
          }),
      gr.services.users.get({ id: reaction_user_id }),
    ]);

    const companyName = company?.name || "";
    const workspaceName = workspace_id === "direct" ? "Direct" : workspace?.name || "";
    const userName = this.getUserName(user) || "Tdrive";

    if (Channel.isDirectChannel(channel)) {
      title = `${userName} in ${companyName}`;
    } else {
      title = `${channel.name} in ${companyName} • ${workspaceName}`;
    }

    return {
      title,
      text: `${userName}: ${reaction}`,
    };
  }

  getUserName(user: User): string {
    return (
      `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || `@${user?.username_canonical}`
    );
  }
}
