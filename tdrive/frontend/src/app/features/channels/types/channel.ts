import { ChannelMemberType } from 'app/features/channel-members/types/channel-member-types';
import { UserType } from 'app/features/users/types/user';
import _ from 'lodash';

export type ChannelType = {
  company_id?: string;
  workspace_id?: string | null; //Null for direct messages
  type?: string;
  id?: string;
  icon?: string;
  name?: string;
  description?: string;
  channel_group?: string;
  visibility?: 'public' | 'direct' | 'private';
  is_default?: boolean;
  members?: string[];
  owner?: string;
  members_count?: number;
  guests_count?: number;
  messages_count?: number;
  archived?: false | true;
  archivation_date?: number; //Timestamp
  user_member?: ChannelMemberType;
  connectors?: string[];
  last_activity?: number;
  last_message?: {
    date: number;
    sender: string;
    title: string;
    text: string;
  };
  stats?: {
    members: number;
    messages: number;
  };
  users?: UserType[];
  is_readonly?: boolean;
};

export const createDirectChannelFromUsers = (companyId: string, users: UserType[]): ChannelType => {
  users = _.uniqBy(users, 'id');
  const id = users.map(u => u.id).join('_') + '_frontend';
  return {
    company_id: companyId,
    workspace_id: 'direct',
    visibility: 'direct',
    id: id,
    members: users.map(u => u.id).filter(a => a) as string[],
    owner: users[0].id,
    members_count: users.length,
    guests_count: 0,
    messages_count: 0,
    archived: false,
    user_member: {
      user_id: users[0].id,
      channel_id: id,
    },
    connectors: [],
    users: users,
  };
};
