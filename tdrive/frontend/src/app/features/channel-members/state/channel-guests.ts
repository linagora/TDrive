/* eslint-disable @typescript-eslint/no-unused-vars */
import { atomFamily } from 'recoil';

import {
  AtomChannelMembersKey,
  ChannelMemberType,
} from 'app/features/channel-members/types/channel-member-types';

export const ChannelGuestsState = atomFamily<ChannelMemberType[], AtomChannelMembersKey>({
  key: 'ChannelGuestsState',
  default: _key => [],
});
