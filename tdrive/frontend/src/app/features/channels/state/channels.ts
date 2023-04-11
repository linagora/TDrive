import { atom, atomFamily, selectorFamily } from 'recoil';
import _ from 'lodash';

import { ChannelType } from 'app/features/channels/types/channel';

type ChannelsListContextType = { companyId: string; workspaceId: string };

export const ChannelsState = atom<ChannelType[]>({
  key: 'ChannelsState',
  default: [],
});

export const ChannelSelector = selectorFamily<ChannelType | undefined, string>({
  key: 'ChannelSelector',
  get:
    channelId =>
    ({ get }) => {
      const channels = get(ChannelsState);
      return _.find(channels, { id: channelId });
    },
});

export const MineChannelsState = atomFamily<ChannelType[], ChannelsListContextType>({
  key: 'MineChannelsState',
  default: [],
});

export const ReachableChannelsState = atomFamily<ChannelType[], ChannelsListContextType>({
  key: 'ReachableChannelsState',
  default: [],
});

export const DirectChannelsState = atomFamily<ChannelType[], string>({
  key: 'DirectChannelsState',
  default: [],
});
