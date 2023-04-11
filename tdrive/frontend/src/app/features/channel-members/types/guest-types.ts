import { PendingEmail } from 'app/features/pending-emails/types/pending-email';
import { ChannelMemberType } from './channel-member-types';

export type GenericMemberType = 'pending-email' | 'guest';

export type GenericMember = {
  key: string;
  type: GenericMemberType;
  filterString: string;
  resource: PendingEmail | ChannelMemberType;
};
