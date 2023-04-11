import { DriveItem } from 'app/features/drive/types';
import { atomFamily } from 'recoil';

export type RecentDriveItems = {
  results: DriveItem[];
  nextPage: string | null;
};

export const RecentDriveItemsState = atomFamily<RecentDriveItems, string>({
  key: 'RecentDriveItemsState',
  default: () => ({ results: [], nextPage: '' }),
});