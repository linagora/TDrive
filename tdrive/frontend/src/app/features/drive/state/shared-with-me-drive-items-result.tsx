import { DriveItem } from '@features/drive/types';
import { atomFamily, selectorFamily } from 'recoil';

export type SharedWithMeDriveItemsResults = {
  results: DriveItem[];
  nextPage: string | null;
};

export const SharedWithMeDriveItemsResultsState = atomFamily<SharedWithMeDriveItemsResults, string>({
  key: 'SharedWithMeDriveItemsResultsState',
  default: () => ({ results: [], nextPage: '' }),
});

export const SearchFilesResultsNumberSelector = selectorFamily<number, string>({
  key: 'SharedWithMeDriveItemsResultsNumberSelector',
  get:
    (companyId: string) =>
    ({ get }) => {
      const snapshot = get(SharedWithMeDriveItemsResultsState(companyId));
      return snapshot.results.length;
    },
});
