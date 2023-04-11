import { atom, selectorFamily } from 'recoil';
import { NotificationType } from '../../types/notification-types';

export type NotificationBadgeType = NotificationType;

export const NotificationsBadgesState = atom<NotificationBadgeType[]>({
  key: 'NotificationsBadgesState',
  default: [],
});

export const NotificationsChannelBadgesSelector = selectorFamily<NotificationBadgeType[], string>({
  key: 'NotificationsChannelBadgesSelector',
  get:
    str =>
    ({ get }) =>
      get(NotificationsBadgesState).filter(badge => badge.channel_id === str),
});

export const NotificationsWorkspaceBadgesSelector = selectorFamily<NotificationBadgeType[], string>(
  {
    key: 'NotificationsWorkspaceBadgesSelector',
    get:
      str =>
      ({ get }) =>
        get(NotificationsBadgesState).filter(badge => badge.workspace_id === str),
  },
);

export const NotificationsCompanyBadgesSelector = selectorFamily<NotificationBadgeType[], string>({
  key: 'NotificationsCompanyBadgesSelector',
  get:
    str =>
    ({ get }) =>
      get(NotificationsBadgesState).filter(badge => badge.company_id === str),
});

export const NotificationsOtherCompanyBadgesSelector = selectorFamily<
  NotificationBadgeType[],
  string
>({
  key: 'NotificationsOtherCompanyBadgesSelector',
  get:
    str =>
    ({ get }) =>
      get(NotificationsBadgesState).filter(badge => badge.company_id !== str),
});
