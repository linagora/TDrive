import { ChannelMemberRole } from '../types/channel-member-types';

export const isGuestMember = (role: ChannelMemberRole) => {
  return role === 'member';
};
