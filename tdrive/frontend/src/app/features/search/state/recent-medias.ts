import { MessageFileType } from 'app/features/messages/types/message';
import { atomFamily } from 'recoil';

export type RecentMedias = {
  results: MessageFileType[];
  nextPage: string | null;
};

export const RecentMediasState = atomFamily<RecentMedias, string>({
  key: 'RecentMediasState',
  default: () => ({ results: [], nextPage: '' }),
});
