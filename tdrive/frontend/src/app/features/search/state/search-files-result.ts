import { MessageFileType } from 'app/features/messages/types/message';
import { atomFamily, selectorFamily } from 'recoil';

export type SearchFilesResults = {
  results: MessageFileType[];
  nextPage: string | null;
};

export const SearchFilesResultsState = atomFamily<SearchFilesResults, string>({
  key: 'SearchFilesResultsState',
  default: () => ({ results: [], nextPage: '' }),
});

export const SearchFilesResultsNumberSelector = selectorFamily<number, string>({
  key: 'SearchFilesResultsNumberSelector',
  get:
    (companyId: string) =>
    ({ get }) => {
      const snapshot = get(SearchFilesResultsState(companyId));
      return snapshot.results.length;
    },
});
