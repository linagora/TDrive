import { atom } from 'recoil';

import { ClientStateType } from 'app/features/router/services/router-service';

export const RouterState = atom<ClientStateType | undefined>({
  key: 'RouterState',
  default: undefined,
});
