import { useRecoilState, useRecoilValue } from 'recoil';

import { useGlobalEffect } from 'app/features/global/hooks/use-global-effect';
import { useRealtimeRoom } from 'app/features/global/hooks/use-realtime';
import { LoadingState } from 'app/features/global/state/atoms/Loading';
import { UserType } from 'app/features/users/types/user';
import UserAPIClient from '../api/user-api-client';
import { UserSelector, UserByUsernameSelector } from '../state/selectors/user-selector';

export const useUserByUsername = (username: string): UserType | undefined => {
  const userId = useRecoilValue(UserByUsernameSelector(username));
  return useRecoilValue(UserSelector(userId || ''));
};

export const useUser = (userId: string): UserType | undefined => {
  const user = useRecoilValue(UserSelector(userId));
  const [, setLoading] = useRecoilState(LoadingState(`user-${userId}`));

  const refresh = async () => {
    setLoading(true);
    UserAPIClient.list([userId], undefined, {
      bufferize: true,
      callback: () => {
        setLoading(false);
      },
    });
  };

  useGlobalEffect(
    `use-user-${userId}`,
    () => {
      if (!user) refresh();
    },
    [],
  );

  const room = UserAPIClient.websocket(userId);
  useRealtimeRoom<UserType>(room, 'useUser', () => {
    refresh();
  });

  return user;
};
