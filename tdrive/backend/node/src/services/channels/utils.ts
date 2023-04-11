import { ChannelType } from "./types";

export function isDirectChannel(channel: { workspace_id: string }): boolean {
  return channel?.workspace_id === ChannelType.DIRECT;
}
