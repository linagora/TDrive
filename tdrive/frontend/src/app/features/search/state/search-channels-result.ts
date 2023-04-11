import { ChannelType } from 'app/features/channels/types/channel';
import { atomFamily, selectorFamily } from 'recoil';

export type SearchChannelsResults = {
  results: ChannelType[];
  nextPage: string | null;
};

export const SearchUsersChannelsResultsState = atomFamily<SearchChannelsResults, string>({
  key: 'SearchChannelsResultsState',
  default: () => ({ results: [], nextPage: '' }),
});

export const SearchChannelsResultsState = atomFamily<SearchChannelsResults, string>({
  key: 'SearchChannelsResultsState',
  default: () => ({ results: [], nextPage: '' }),
});

export const SearchChannelsResultsNumberSelector = selectorFamily<number, string>({
  key: 'SearchChannelsResultsNumberSelector',
  get:
    (companyId: string) =>
    ({ get }) => {
      const snapshot = get(SearchChannelsResultsState(companyId));
      return snapshot.results.length;
    },
});
