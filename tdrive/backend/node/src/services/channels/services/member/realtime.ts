import { Channel, User, WebsocketMetadata } from "../../../../utils/types";
import { ChannelMember } from "../../entities";
import { getChannelPath, getChannelsPath } from "../channel/realtime";
import { ChannelExecutionContext } from "../../types";

export function getPrivateRoomName(channel: Channel, user: User): string {
  return `/companies/${channel.company_id}/workspaces/${channel.workspace_id}/channels/${channel.id}?type=private&user=${user.id}`;
}

export function getPublicRoomName(channel: Channel): string {
  return `/companies/${channel.company_id}/workspaces/${channel.workspace_id}/channels/${channel.id}?type=public`;
}

export function getRoomName(channelOrContext: Channel | ChannelExecutionContext): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const channel = (channelOrContext as any).channel
    ? (channelOrContext as ChannelExecutionContext).channel
    : (channelOrContext as Channel);

  return getPublicRoomName(channel);
}

export function getMembersPath(channel: Channel): string {
  return `${getChannelsPath(channel)}/members`;
}

export function getMemberPath(member: ChannelMember, context?: ChannelExecutionContext): string {
  const parentContext = {
    workspace: {
      company_id: context?.channel?.company_id,
      workspace_id: context?.channel?.workspace_id,
    },
    user: context?.user,
  };

  return `${getChannelPath(context.channel, parentContext)}/members/${member.user_id}`;
}

export function getChannelRooms(channel: Channel, user: User): WebsocketMetadata[] {
  return [{ room: getPublicRoomName(channel) }, { room: getPrivateRoomName(channel, user) }];
}
