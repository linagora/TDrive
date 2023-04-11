import { useState, useEffect } from 'react';
import { isArray } from 'lodash';
import UserListenerService from 'app/features/users/services/listen-users-service';
import Collections from 'app/deprecated/CollectionsV1/Collections/Collections';
import UsersService from 'app/features/users/services/current-user-service';
import userAsyncGet from 'app/features/users/utils/async-get';

export const useUsersListener = (usersIds: string[] = []) => {
  const users = (isArray(usersIds) ? usersIds : []).filter(
    e => (usersIds.length || 0) === 1 || e !== UsersService.getCurrentUserId(),
  );
  Collections.get('users').useListener(useState, users);

  useEffect(() => {
    users.forEach(userId => {
      UserListenerService.listenUser(userId);
      userAsyncGet(userId);
    });

    return () => {
      users.forEach(userId => UserListenerService.cancelListenUser(userId));
    };
  }, [users]);

  return users;
};
