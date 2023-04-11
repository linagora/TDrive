import { User, WebsocketMetadata, Workspace } from "../../../../utils/types";
import { Channel } from "../../entities";
import { WorkspaceExecutionContext } from "../../types";
import { isDirectChannel } from "../../utils";

export function getWebsocketInformation(channel: Channel): WebsocketMetadata {
  return {
    name: channel.name,
    room: getChannelPath(channel),
  };
}

export function getWorkspaceRooms(workspace: Workspace, user: User): WebsocketMetadata[] {
  return isDirectChannel(workspace)
    ? [{ room: getDirectChannelRoomName(workspace, user.id) }]
    : [{ room: getPublicRoomName(workspace) }, { room: getPrivateRoomName(workspace, user) }];
}

export function getDirectChannelRoomName(workspace: Workspace, userId: string): string {
  return `/companies/${workspace.company_id}/workspaces/direct/channels?type=direct&user=${userId}`;
}

export function getDirectChannelRooms(workspace: Workspace, channel: Channel): string[] {
  return (channel.members || []).map(member => getDirectChannelRoomName(workspace, member));
}

export function getPrivateRoomName(workspace: Workspace, user: User): string {
  return `/companies/${workspace.company_id}/workspaces/${workspace.workspace_id}/channels?type=private&user=${user.id}`;
}

export function getPublicRoomName(workspace: Workspace): string {
  return `/companies/${workspace?.company_id}/workspaces/${workspace?.workspace_id}/channels?type=public`;
}

export function getRoomName(channel: Channel, context?: WorkspaceExecutionContext): string[] {
  return isDirectChannel(channel)
    ? getDirectChannelRooms(context.workspace, channel)
    : [getPublicRoomName(context.workspace)];
}

export function getChannelPath(
  channel: Pick<Channel, "id">,
  context?: WorkspaceExecutionContext,
): string {
  return `${getChannelsPath(context?.workspace)}/${channel.id}`;
}

export function getChannelsPath(workspace?: Workspace): string {
  return workspace
    ? `/companies/${workspace.company_id}/workspaces/${workspace.workspace_id}/channels`
    : "/channels";
}
