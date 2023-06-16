import { string } from 'prop-types';
import { atom } from 'recoil';

export type SharedWithMeFilter = {
  mimeType: string;
  creator: string;
  date: string;
};

export const SharedWithMeFilterState = atom<SharedWithMeFilter>({
  key: 'SharedWithMeFilterState',
  default: {
    mimeType: '',
    creator: '',
    date: '',
  },
});