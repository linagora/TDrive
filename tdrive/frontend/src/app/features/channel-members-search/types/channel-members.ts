import { WebsocketRoom } from 'app/features/global/types/websocket-types';
import { UserType } from 'app/features/users/types/user';

export type ChannelMemberRole = 'member' | 'guest' | 'bot';

export type ChannelMemberNotificationLevel = 'all' | 'none' | 'mentions' | 'me';

export type ChannelMemberType = {
  user_id?: string;
  channel_id?: string;
  type?: ChannelMemberRole;
  last_access?: number; //Timestamp in seconds
  last_increment?: number; //Number
  favorite?: boolean; //Did the user add this channel to its favorites
  notification_level?: ChannelMemberNotificationLevel;
};

export type ParamsChannelMember = {
  companyId?: string;
  workspaceId?: string;
  channelId: string;
};

export type QueryChannelMember = {
  search: string;
};

export type ResponseChannelMemberTypeList = {
  resources: ChannelMemberWithUser[]; // before ChannelMemberType
  websockets: WebsocketRoom[];
};

export type PayloadChannelMemberType = {
  resource: Partial<ChannelMemberType>;
};

export type ResponseChannelMemberType = {
  resource: ChannelMemberType;
};

export type ChannelPendingEmail = {
  workspace_id: string;
  channel_id: string;
  company_id: string;
  email: string;
};

export type ChannelPendingEmailResponse = {
  resources: ChannelPendingEmail[];
};

export type PayloadChannelPendingEmail = {
  resource: Partial<ChannelPendingEmail>;
};

export type ResponseChannelPendingEmail = {
  resource: ChannelPendingEmail;
};

export type ResponseDeletePendingEmailResponse = { status: 'success' | 'error' };

export type ChannelMemberWithUser = ChannelMemberType & { user: UserType };
