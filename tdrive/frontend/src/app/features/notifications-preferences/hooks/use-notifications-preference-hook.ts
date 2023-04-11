import { useRecoilState } from 'recoil';

import { useGlobalEffect } from 'app/features/global/hooks/use-global-effect';
import { LoadingState } from 'app/features/global/state/atoms/Loading';
import NotificationsPreferencesAPIClientService from '../api/notifications-preferences-api-client';
import { NotificationsPreferencesState } from '../state/notifications-preferences';
import { NotificationPreferencesType, preferencesType} from '../types/notifications-preferences';

export const UseNotificationPreferences = (): {
  notifsPreferences: NotificationPreferencesType[];
  loading: boolean;
  refresh: () => Promise<void>;
  save: (preferences: preferencesType) => Promise<void>;
} => {
  const [notifsPreferences, _setnPreferences] = useRecoilState(NotificationsPreferencesState);
  const [loading, setLoading] = useRecoilState(LoadingState(`notifications-preferences`));

  const refresh = async () => {
    const nPreferencesUpdated: NotificationPreferencesType | undefined = await NotificationsPreferencesAPIClientService.get();

    if (nPreferencesUpdated) _setnPreferences([nPreferencesUpdated]);
  };

  const save = async (preferences: preferencesType) => {
    await NotificationsPreferencesAPIClientService.save(preferences);
    setLoading(false);
    refresh();
  }

  useGlobalEffect(
    'UseNotificationPreferences',
    async () => {
      if (!notifsPreferences) setLoading(true);

      await refresh();

      setLoading(false);
    },
    [],
  );

  return {
    notifsPreferences,
    loading,
    refresh,
    save,
  };
};
