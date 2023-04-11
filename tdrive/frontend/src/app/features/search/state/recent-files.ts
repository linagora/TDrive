import { MessageFileType } from 'app/features/messages/types/message';
import { atomFamily } from 'recoil';

export type RecentFiles = {
  results: MessageFileType[];
  nextPage: string | null;
};

export const RecentFilesState = atomFamily<RecentFiles, string>({
  key: 'RecentFilesState',
  default: () => ({ results: [], nextPage: '' }),
});
