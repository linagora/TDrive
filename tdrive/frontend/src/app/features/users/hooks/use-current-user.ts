/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';
import LoginService from '@features/auth/login-service';
import UserAPIClient from '@features/users/api/user-api-client';
import { useRecoilState } from 'recoil';
import { CurrentUserState } from '../state/atoms/current-user';
import { useRealtimeRoom } from '@features/global/hooks/use-realtime';
import Languages from '@features/global/services/languages-service';
import ConfiguratorsManager from '@deprecated/Configurators/ConfiguratorsManager.js';
import { RealtimeApplicationEvent } from '@features/global/types/realtime-types';
import { useSetUserList } from './use-user-list';

export const useCurrentUser = () => {
  console.log("getting current user");
  const [user, setUser] = useRecoilState(CurrentUserState);
  const { set: setUserList } = useSetUserList('useCurrentUser');

  //Depreciated way to get use update from LoginService
  LoginService.recoilUpdateUser = setUser;
  useEffect(() => {
    if (!user) {
      LoginService.init();
      LoginService.login({});
    }
    if (user) setUserList([user]);
  }, [user]);

  //Update app language
  useEffect(() => {
    if (user?.preferences?.locale) Languages.setLanguage(user?.preferences?.locale);
  }, [user?.preferences?.locale]);

  const updateStatus = async (userStatus: string[]) => {
    await UserAPIClient.updateUserStatus(`${userStatus[0]} ${userStatus[1]}`);

    await refresh();
  };

  const refresh = async () => {
    await LoginService.updateUser();
  };

  return { user, refresh, updateStatus };
};

const applicationEventHandler = (event: RealtimeApplicationEvent) => {
  switch (event.action) {
    case 'configure':
      if (event.form) {
        ConfiguratorsManager.openConfigurator(
          event.application,
          event.form,
          event.hidden_data,
          event.configurator_id,
        );
      } else {
        ConfiguratorsManager.closeConfigurator(event.application);
      }
      break;
    default:
      console.error(`Unknown application action: ${event.action}`);
  }
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
      case 'application':
        applicationEventHandler(resource);
        break;
      default:
        console.error('Unknown resource type');
    }
  });
};
