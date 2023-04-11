import { atomFamily, selectorFamily } from 'recoil';
import { ChannelMemberReadSectionType } from '../types/channel-member-read-section-type';

export const ChannelMembersReadSectionsStateFamily = atomFamily<ChannelMemberReadSectionType[], string>(
  {
    key: 'ChannelMembersReadSectionsStateFamily',
    default: []
  }
);

export const ChannelMembersReadSectionsSelector = selectorFamily<ChannelMemberReadSectionType[], { channelId: string }>(
  {
    key: 'ChannelMembersReadSectionsSelector',
    get: ({ channelId }) => ({ get }) => {
      const sections = get(ChannelMembersReadSectionsStateFamily(channelId));

      if (sections) {
        return sections;
      }

      return [];
    }
  }
);

export const ChannelMemberReadSectionSelector = selectorFamily<ChannelMemberReadSectionType | null, { channelId: string; userId: string }>({
  key: 'ChannelMemberReadSectionSelector',
  get: ({ channelId, userId }) => ({ get }) => {
    const sections = get(ChannelMembersReadSectionsStateFamily(channelId));

    const section = (sections || []).find(s => s.user_id === userId);

    if (section) {
      return section;
    }

    return null;
  }
});
