export type ChannelMemberReadSectionType = {
  channel_id: string;
  company_id: string;
  user_id: string;
  read_section: ReadSection;
}

export type ReadSection = [string, string];
