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

export type AtomChannelMembersKey = {
  companyId: string;
  workspaceId: string;
  channelId: string;
};
