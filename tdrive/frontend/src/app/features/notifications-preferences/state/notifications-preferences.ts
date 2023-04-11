import { atom } from 'recoil';

import { NotificationPreferencesType } from '../types/notifications-preferences';

export const NotificationsPreferencesState = atom<NotificationPreferencesType[]>({
  key: 'NotificationsPreferencesState',
  default: [],
});
