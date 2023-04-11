import { ChannelMemberType } from 'app/features/channel-members/types/channel-member-types';
import { ChannelType } from './channel';

export type ChannelsReachableGetResponse = { resources: ChannelType[] };
export type ChannelsReachableInviteUserResponse = { resource: ChannelMemberType };
export type ChannelsReachableInviteUserRequest = {
  resource: {
    user_id: string;
  };
};

export type ChannelsReachableRemoveUserResponse = {
  status: 'success' | 'error';
  errors: string[]; //List of errors
};
