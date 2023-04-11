import { getLogger } from "../../../../core/platform/framework";
import { MessageQueueHandler } from "../../../../core/platform/services/message-queue/api";
import { NewUserInWorkspaceNotification } from "../channel/types";
import gr from "../../../global-resolver";
import { ExecutionContext } from "../../../../core/platform/framework/api/crud-service";

const NAME = "Channel::NewPendingEmailsInWorkspaceJoinChannelsProcessor";
const logger = getLogger(
  "channel.message-queue.new-pending-emails-in-workspace-join-channels-processor",
);

/**
 * When a new pending email is added in a workspace, a `workspace:email:added` event is published.
 * In such case, the email must be added to all the channels that he is invited.
 */
export class NewPendingEmailsInWorkspaceJoinChannelsProcessor
  implements MessageQueueHandler<NewUserInWorkspaceNotification, void>
{
  readonly topics = {
    in: "workspace:member:added",
  };

  readonly options = {
    unique: true,
    ack: true,
    queue: "workspace:user:added:consumer_channel_pending_emails",
  };

  readonly name = NAME;

  validate(message: NewUserInWorkspaceNotification): boolean {
    return !!(message && message.company_id && message.workspace_id && message.user_id);
  }

  async process(
    message: NewUserInWorkspaceNotification,
    context?: ExecutionContext,
  ): Promise<void> {
    logger.debug("Processing notification for message %o", message);

    try {
      await gr.services.channelPendingEmail.proccessPendingEmails(
        message,
        {
          workspace_id: message.workspace_id,
          company_id: message.company_id,
        },
        context,
      );
    } catch (err) {
      logger.error(
        { err },
        `${this.name} - Error while processing message for pending emails %o`,
        message,
      );
    }
  }
}
