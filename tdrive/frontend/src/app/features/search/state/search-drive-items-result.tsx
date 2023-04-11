import { DriveItem } from 'app/features/drive/types';
import { atomFamily, selectorFamily } from 'recoil';

export type SearchDriveItemsResults = {
  results: DriveItem[];
  nextPage: string | null;
};

export const SearchDriveItemsResultsState = atomFamily<SearchDriveItemsResults, string>({
  key: 'SearchDriveItemsResultsState',
  default: () => ({ results: [], nextPage: '' }),
});

export const SearchFilesResultsNumberSelector = selectorFamily<number, string>({
  key: 'SearchDriveItemsResultsNumberSelector',
  get:
    (companyId: string) =>
    ({ get }) => {
      const snapshot = get(SearchDriveItemsResultsState(companyId));
      return snapshot.results.length;
    },
});
