import { selectorFamily } from 'recoil';
import { UserListState } from 'app/features/users/state/atoms/user-list';
import { UserType } from 'app/features/users/types/user';

export const UserSelector = selectorFamily<UserType | undefined, string>({
  key: 'UserSelector',
  get:
    id =>
    ({ get }) =>
      get(UserListState).find(user => user.id === id),
});

export const UserByUsernameSelector = selectorFamily<string | undefined, string>({
  key: 'UserSelector',
  get:
    str =>
    ({ get }) =>
      get(UserListState).find(user => user.username === str)?.id,
});
