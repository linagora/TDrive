import { atomFamily } from 'recoil';

export type ChannelWritingActivityType = {
  threadId: string;
  userId: string;
  name: string;
};

export const ChannelWritingActivityState = atomFamily<ChannelWritingActivityType[], string>({
  key: 'ChannelWritingActivityState',
  default: [],
});
