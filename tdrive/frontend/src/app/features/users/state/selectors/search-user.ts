import { selectorFamily } from 'recoil';
import { UserType } from 'app/features/users/types/user';

import { UserListState } from 'app/features/users/state/atoms/user-list';

/**
 * Search users locally
 */
export const SearchUserSelector = selectorFamily<UserType[] | null, string>({
  key: 'SearchUserSelector',
  get:
    term =>
    async ({ get }) => {
      return get(UserListState).filter(user =>
        `${user.username || ''} ${user.first_name || ''} ${user.last_name || ''} ${
          user.email || ''
        }`.includes(term),
      );
    },
});
