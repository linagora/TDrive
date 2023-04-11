import { LoadingState } from 'app/features/global/state/atoms/Loading';
import { useRecoilState } from 'recoil';
import ChannelMembersAPIClient from '../api/channel-members-api-client';
import { ChannelMembersReadSectionsStateFamily } from '../state/channel-members-read-sections';
import Numbers from 'app/features/global/utils/Numbers';

export const useChannelMembersReadSections = (
  companyId: string,
  workspaceId: string,
  channelId: string,
) => {
  const [loading, setLoading] = useRecoilState(LoadingState('useChannelMembersReadSections'));
  const [sections, setSections] = useRecoilState(ChannelMembersReadSectionsStateFamily(channelId));

  const refresh = async () => {
    setLoading(true);
    const sections = await ChannelMembersAPIClient.getChannelMembersReadSections({
      companyId,
      workspaceId,
      channelId,
    });

    if (sections) {
      setSections(sections);
    }
    setLoading(false);
  };

  const getMemberReadSection = (userId: string) => {
    return sections.find(section => section.user_id === userId && section.channel_id === channelId);
  };

  const seen = (userId: string, messageId: string): boolean => {
    const userSection = getMemberReadSection(userId);
    if (!userSection) {
      return false;
    }

    const [start, end] = userSection.read_section;
    const startTime = Numbers.timeuuidToDate(start);
    const endTime = Numbers.timeuuidToDate(end);
    const messageTime = Numbers.timeuuidToDate(messageId);

    return startTime <= messageTime && messageTime <= endTime;
  };

  return {
    loading,
    sections,
    refresh,
    getMemberReadSection,
    seen,
  };
};
