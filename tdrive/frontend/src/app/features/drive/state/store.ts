import { atomFamily, atom } from 'recoil';
import { DriveItem, DriveItemDetails } from '../types';

export const DriveItemChildrenAtom = atomFamily<DriveItem[], string>({
  key: 'DriveItemChildrenAtom',
  default: () => [],
});

export const DriveItemAtom = atomFamily<Partial<DriveItemDetails> | null, string>({
  key: 'DriveItemAtom',
  default: () => null,
});

export const DriveItemSelectedList = atom<{[key: string]: boolean }>({
  key: 'DriveItemSelectedList',
  default: {}
});
