/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';
import LoginService from '@features/auth/login-service';
import UserAPIClient from '@features/users/api/user-api-client';
import { useRecoilState } from 'recoil';
import { CurrentUserState } from '../state/atoms/current-user';
import { useRealtimeRoom } from '@features/global/hooks/use-realtime';
import Languages from '@features/global/services/languages-service';
import { useSetUserList } from './use-user-list';
import { getPublicLinkToken } from 'app/features/drive/api-client/api-client';

export const useCurrentUser = () => {
  const [user, setUser] = useRecoilState(CurrentUserState);
  const { set: setUserList } = useSetUserList('useCurrentUser');

  //Depreciated way to get use update from LoginService
  LoginService.recoilUpdateUser = setUser;
  useEffect(() => {
    if (!user && !getPublicLinkToken()) {
      LoginService.init();
      LoginService.login({});
    }
    if (user) setUserList([user]);
  }, [user]);

  //Update app language
  useEffect(() => {
    if (user?.preferences?.locale) Languages.setLanguage(user?.preferences?.locale);
  }, [user?.preferences?.locale]);

  const refresh = async () => {
    if (!getPublicLinkToken()) {
      await LoginService.updateUser();
    }
  };

  return { user, refresh };
};

export const useCurrentUserRealtime = () => {
  const { user, refresh } = useCurrentUser();
  const room = UserAPIClient.websocket(user?.id || '');

  const timeout = useRef(0);

  useRealtimeRoom<any>(room, 'useCurrentUser', async (action, resource) => {
    switch (resource._type) {
      case 'user':
        clearTimeout(timeout.current); //
        timeout.current = setTimeout(() => {
          refresh();
        }, 1000) as any;
        break;
      default:
        console.error('Unknown resource type');
    }
  });
};
