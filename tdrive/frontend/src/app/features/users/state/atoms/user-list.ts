import { atom } from 'recoil';
import { UserType } from 'app/features/users/types/user';

export const UserListState = atom<UserType[]>({
  key: 'UserListState',
  default: [],
});
