import { merge } from "lodash";
import { Channel } from "../../entities/channel";
import { ChannelActivity } from "../../entities/channel-activity";
import { ChannelMember } from "../../entities";
import { UserObject } from "../../../user/web/types";

export type NewUserInWorkspaceNotification = {
  user_id: string;
  company_id: string;
  workspace_id: string;
};

export type ChannelStats = {
  members: number;
  messages: number;
};

type ChannelType = "workspace" | "direct";

export class ChannelMemberObject extends ChannelMember {
  id: string;
  user_id: string;
  // type: "member" | "guest" | "bot";
  last_access: number; //Timestamp in seconds
  last_increment: number;
  favorite: boolean; //Did the user add this channel to its favorites
  // notification_level: "all" | "none" | "group_mentions" | "user_mentions";

  static mapTo(
    channelMember: ChannelMember,
    channelMemberLikeObject: Partial<ChannelMemberObject> = {},
  ): ChannelMemberObject {
    if (!channelMember) {
      return null;
    }

    return merge(new ChannelMemberObject(), {
      favorite: false,
      last_increment: 0,
      last_access: 0,
      ...channelMember,
      ...channelMemberLikeObject,
    });
  }
}

export class ChannelObject extends Channel {
  last_activity?: ChannelActivity["last_activity"];
  last_message?: ChannelActivity["last_message"];
  default: boolean;
  type: ChannelType;
  user_member: ChannelMemberObject;
  users: UserObject[];
  stats: ChannelStats;

  constructor() {
    super();
  }

  static mapTo(channel: Channel, channelLikeObject: Partial<ChannelObject> = {}): ChannelObject {
    if (!channel) {
      return null;
    }

    return merge(new ChannelObject(), {
      ...{ last_activity: 0 },
      ...channel,
      ...channelLikeObject,
      ...{ members: channel?.members?.length ? channel.members : [] },
      default: channel.is_default,
    });
  }
}

export type SearchChannelOptions = {
  search: string;
  companyId?: string;
};

export type ChannelActivityMessage = {
  date: number;
  sender: string;
  sender_name: string;
  title: string;
  text: string;
};
