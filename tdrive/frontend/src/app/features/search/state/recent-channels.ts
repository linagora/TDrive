import { ChannelType } from 'app/features/channels/types/channel';
import { atomFamily } from 'recoil';

export type RecentChannels = {
  results: ChannelType[];
  nextPage: string | null;
};

export const RecentChannelsState = atomFamily<RecentChannels, string>({
  key: 'RecentChannelsState',
  default: () => ({ results: [], nextPage: '' }),
});
