/* eslint-disable @typescript-eslint/no-unused-vars */
import { atomFamily } from 'recoil';

import {
  AtomChannelMembersKey,
  ChannelMemberType,
} from 'app/features/channel-members/types/channel-member-types';

export const ChannelMembersState = atomFamily<ChannelMemberType[], AtomChannelMembersKey>({
  key: 'ChannelMembersState',
  default: _key => [],
});
