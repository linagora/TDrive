import { getLogger } from "../../../../core/platform/framework";
import { MessageQueueHandler } from "../../../../core/platform/services/message-queue/api";
import { ChannelActivityNotification } from "../../types";
import { CounterProvider } from "../../../../core/platform/services/counter/provider";
import {
  ChannelCounterEntity,
  ChannelUserCounterType,
  TYPE as ChannelCounterEntityType,
} from "../../entities/channel-counters";
import gr from "../../../global-resolver";

const logger = getLogger("channel.message-queue.new-channel-activity");
export class NewChannelActivityProcessor
  implements MessageQueueHandler<ChannelActivityNotification, void>
{
  private channelCounter: CounterProvider<ChannelCounterEntity>;

  async init() {
    const channelCountersRepository = await gr.database.getRepository<ChannelCounterEntity>(
      ChannelCounterEntityType,
      ChannelCounterEntity,
    );
    this.channelCounter = await gr.platformServices.counter.getCounter<ChannelCounterEntity>(
      channelCountersRepository,
    );
    return this;
  }

  readonly topics = {
    in: "channel:activity",
  };

  readonly options = {
    unique: true,
    ack: true,
  };

  readonly name = "NewChannelActivityProcessor";

  validate(message: ChannelActivityNotification): boolean {
    return !!(message && message.channel_id && message.company_id && message.workspace_id);
  }

  async process(message: ChannelActivityNotification): Promise<void> {
    logger.info(`${this.name} - Processing new activity in channel ${message.channel_id}`);

    await this.channelCounter.increase(
      {
        id: message.channel_id,
        company_id: message.company_id,
        workspace_id: message.workspace_id,
        counter_type: ChannelUserCounterType.MESSAGES,
      },
      1,
    );

    try {
      await gr.services.channels.channels.updateLastActivity(
        {
          date: message.date,
          channel: {
            id: message.channel_id,
            workspace_id: message.workspace_id,
            company_id: message.company_id,
          },
          message: {
            date: message.date,
            sender: message.sender,
            sender_name: message.sender_name,
            title: message.title,
            text: message.body,
          },
        },
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
        `${this.name} - Error while applying channel new activity in channel ${message?.channel_id}`,
      );
    }
  }
}
