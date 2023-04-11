import { atom } from 'recoil';

export const useWebState = atom<boolean>({
  key: 'useWebState',
  default: true,
});
