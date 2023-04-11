import { MessageFileType } from 'app/features/messages/types/message';
import { atomFamily, selectorFamily } from 'recoil';

export type SearchMediasResults = {
  results: MessageFileType[];
  nextPage: string | null;
};

export const SearchMediasResultsState = atomFamily<SearchMediasResults, string>({
  key: 'SearchMediasResultsState',
  default: () => ({ results: [], nextPage: '' }),
});

export const SearchMediasResultsNumberSelector = selectorFamily<number, string>({
  key: 'SearchMediasResultsNumberSelector',
  get:
    (companyId: string) =>
    ({ get }) => {
      const snapshot = get(SearchMediasResultsState(companyId));
      return snapshot.results.length;
    },
});
