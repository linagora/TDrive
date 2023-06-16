import { atom } from 'recoil';

export type SharedWithMeFilter = {
  mimeType: string;
  creator: string;
};

export const SharedWithMeFilterState = atom<SharedWithMeFilter>({
  key: 'SharedWithMeFilterState',
  default: {
    mimeType: '',
    creator: '',
  },
});