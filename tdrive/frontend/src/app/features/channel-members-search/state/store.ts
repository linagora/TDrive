import { atomFamily, selectorFamily, SerializableParam } from 'recoil';
import { ChannelMemberWithUser, ChannelPendingEmail } from '../types/channel-members';

// ChannelMemberType
export const ListChannelMembersStateFamily = atomFamily<ChannelMemberWithUser[], SerializableParam>(
  {
    key: 'ListChannelMembersStateFamily',
    default: [],
  },
);

export const ListPendingEmailsStateFamily = atomFamily<ChannelPendingEmail[], SerializableParam>({
  key: 'ListPendingEmailsStateFamily',
  default: [],
});

export const ChannelMemberSelector = selectorFamily<
  ChannelMemberWithUser | null,
  { channelId: string; userId: string }
>({
  key: 'ChannelMemberSelector',
  get:
    ({ channelId, userId }) =>
    ({ get }) => {
      const members = get(ListChannelMembersStateFamily(channelId));

      const member = (members || []).find(m => m.user_id === userId);

      if (member) {
        return member;
      }

      return null;
    },
});

export const PendingEmailSelector = selectorFamily<
  ChannelPendingEmail | null,
  { channelId: string; email: string }
>({
  key: 'PendingEmailSelector',
  get:
    ({ channelId, email }) =>
    ({ get }) => {
      const pendingEmails = get(ListPendingEmailsStateFamily(channelId));

      const guest = (pendingEmails || []).find(m => m.email === email);

      if (guest) {
        return guest;
      }

      return null;
    },
});
