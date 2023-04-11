import { atom } from 'recoil';
import { DriveItem, DriveItemDetails } from '../types';

export const DriveViewerState = atom<{
  item: null | DriveItem;
  details?: DriveItemDetails;
  loading: boolean;
}>({
  key: "DriveViewerState",
  default: {
    item: null,
    loading: true
  }
});
