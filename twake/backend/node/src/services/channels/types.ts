import { ExecutionContext } from "../../core/platform/framework/api/crud-service";
import { Channel, uuid, Workspace } from "../../utils/types";

export interface WorkspaceExecutionContext extends ExecutionContext {
  workspace: Workspace;
}

export interface ChannelExecutionContext extends ExecutionContext {
  channel: Channel;
}

export interface ChannelSystemExecutionContext {
  workspace: Workspace;
  channel?: Channel;
}

export enum ChannelVisibility {
  PRIVATE = "private",
  PUBLIC = "public",
  DIRECT = "direct",
}

export enum ChannelType {
  DIRECT = "direct",
}

export enum ChannelMemberType {
  MEMBER = "member",
  GUEST = "guest",
  BOT = "bot",
}

export enum ChannelMemberNotificationLevel {
  // be notified on all messages
  ALL = "all",
  // Only be notified on @user, @all, @here, @everyone mentions
  MENTIONS = "mentions",
  // Only be notified on @user mention
  ME = "me",
  // do not be notified at all even when someone mention user, not on direct channels
  NONE = "none",
}

export type ChannelActivityNotification = {
  company_id: uuid;
  workspace_id: uuid | "direct";
  channel_id: uuid;
  date: number;
  sender: string;
  title: string;
  text: string;
  sender_name: string;
  body: string;
};
