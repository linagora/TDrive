import { atom } from 'recoil';

export type ConnectedStateType = {
  connected: boolean;
  reconnecting: boolean;
};

export const ConnectedState = atom<ConnectedStateType>({
  key: 'ConnectedState',
  default: { connected: true, reconnecting: false },
});
