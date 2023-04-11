import { atomFamily } from 'recoil';

export const LoadingState = atomFamily<boolean, string>({
  key: 'LoadingState',
  default: () => false,
});

export const LoadingStateInitTrue = atomFamily<boolean, string>({
  key: 'LoadingStateInitTrue',
  default: () => true,
});
