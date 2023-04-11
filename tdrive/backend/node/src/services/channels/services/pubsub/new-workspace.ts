import { getLogger } from "../../../../core/platform/framework";
import { MessageQueueHandler } from "../../../../core/platform/services/message-queue/api";
import { ChannelActivityNotification, ChannelVisibility } from "../../types";
import { getInstance } from "../../../channels/entities/channel";
import gr from "../../../global-resolver";

const logger = getLogger("channel.message-queue.new-channel-activity");
export class NewWorkspaceProcessor
  implements MessageQueueHandler<ChannelActivityNotification, void>
{
  readonly topics = {
    in: "workspace:added",
    queue: "workspace:added:consumer1",
  };

  readonly options = {
    unique: true,
    ack: true,
  };

  readonly name = "NewWorkspaceProcessor";

  validate(message: ChannelActivityNotification): boolean {
    return !!(message && message.company_id && message.workspace_id);
  }

  async process(message: ChannelActivityNotification): Promise<void> {
    logger.info(`${this.name} - Processing new workspace created ${message.workspace_id}`);

    try {
      await gr.services.channels.channels.save(
        getInstance({
          icon: "💬",
          name: "General",
          description: "",
          visibility: ChannelVisibility.PUBLIC,
          is_default: true,
        }),
        {},
        {
          workspace: {
            workspace_id: message.workspace_id,
            company_id: message.company_id,
          },
          user: {
            id: message.sender,
          },
        },
      );
    } catch (err) {
      logger.error(
        { err },
        `${this.name} - Error while generating default channels for workspace ${message?.workspace_id}`,
      );
    }
  }
}
