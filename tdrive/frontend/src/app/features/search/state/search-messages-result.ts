import { Message } from 'app/features/messages/types/message';
import { atomFamily, selectorFamily } from 'recoil';

export type SearchMessagesResults = {
  results: Message[];
  nextPage: string | null;
};

export const SearchMessagesResultsState = atomFamily<SearchMessagesResults, string>({
  key: 'SearchMessagesResultsState',
  default: () => ({ results: [], nextPage: '' }),
});

export const SearchMessagesResultsNumberSelector = selectorFamily<number, string>({
  key: 'SearchMessagesResultsNumberSelector',
  get:
    (companyId: string) =>
    ({ get }) => {
      const snapshot = get(SearchMessagesResultsState(companyId));
      return snapshot.results.length;
    },
});
