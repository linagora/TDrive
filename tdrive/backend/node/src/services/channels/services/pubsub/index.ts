import { Initializable } from "../../../../core/platform/framework";
import { NewChannelActivityProcessor } from "./new-channel-activity";
import { NewUserInWorkspaceJoinDefaultChannelsProcessor } from "./new-user-in-workspace-join-default-channels";
import { NewPendingEmailsInWorkspaceJoinChannelsProcessor } from "./new-pending-emails-in-workspace-join-channels";
import { NewWorkspaceProcessor } from "./new-workspace";
import gr from "../../../global-resolver";

export class ChannelsMessageQueueListener implements Initializable {
  async init(): Promise<this> {
    const channelActivityProcessor = await new NewChannelActivityProcessor().init();
    gr.platformServices.messageQueue.processor.addHandler(channelActivityProcessor);
    gr.platformServices.messageQueue.processor.addHandler(
      new NewUserInWorkspaceJoinDefaultChannelsProcessor(),
    );
    gr.platformServices.messageQueue.processor.addHandler(
      new NewPendingEmailsInWorkspaceJoinChannelsProcessor(),
    );
    gr.platformServices.messageQueue.processor.addHandler(new NewWorkspaceProcessor());

    return this;
  }
}
