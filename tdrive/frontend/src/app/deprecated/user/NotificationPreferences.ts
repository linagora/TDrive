/* eslint-disable @typescript-eslint/no-explicit-any */
import moment from 'moment';

import Observable from 'app/deprecated/Observable/Observable';
import Languages from 'app/features/global/services/languages-service';
import { ToasterService as Toaster } from 'app/features/global/services/toaster-service';
import {
  NotificationPreferencesType,
  preferencesType,
} from 'app/features/users/types/notification-preferences-type';

type Keys = keyof preferencesType;
type Values = preferencesType[Keys];

class NotificationPreferencesService extends Observable {
  url = '/notifications/v1/preferences/';
  notificationPreferences: NotificationPreferencesType | null = null;

  async init(): Promise<void> {
    //TODO
  }

  /**
   *
   * @param preferences
   */
  async save(preferences: { key: Keys; value: Values }[]): Promise<void> {
    const newPreferences: any = {};

    preferences.map(({ key, value }) => (newPreferences[key] = value));

    Toaster.success(Languages.t('services.user.notification_parameters_update_alert'), 3);
  }

  areNotificationsAllowed(): boolean {
    if (this.notificationPreferences) {
      const nightBreakIntrv = this.transformPeriod(
        this.notificationPreferences.preferences.night_break.from,
        this.notificationPreferences.preferences.night_break.to,
        -new Date().getTimezoneOffset() / 60,
      );

      const isNightBreak = this.isInPeriod(nightBreakIntrv[0], nightBreakIntrv[1]);
      const isDeactivate =
        new Date().getTime() <
        this.notificationPreferences.preferences.deactivate_notifications_until;

      return isNightBreak ? false : isDeactivate ? false : true;
    }

    return false;
  }

  /**
   *
   * @param timeToAdd Time to add
   * @param format Unit of time
   */
  deactivateNotificationsUntil(timeToAddMs: number): void {
    this.save([
      { key: 'deactivate_notifications_until', value: new Date().getTime() + timeToAddMs },
    ]);
  }

  private isInPeriod(a: number, b: number): boolean {
    const currentDate = new Date().getHours() + Math.floor(new Date().getMinutes() / 30) / 2;

    if (a != null && b != null) {
      if (a < b && currentDate >= a && currentDate < b) {
        return true;
      }
      if (a > b && (currentDate >= a || currentDate < b)) {
        return true;
      }
    }
    return false;
  }

  private transformPeriod(
    start: number | string,
    end: number | string,
    offset: number,
  ): [any, any] {
    let a = Number(start);
    let b = Number(end);

    if (offset > 0) {
      offset += -24;
    }

    a += offset;
    b += offset;

    if (a < 0 || b < 0) {
      a += 24;
      b += 24;

      if (b >= 24) {
        if (a < b) {
          b += -24;
        } else {
          b += -24;
          const c = b;
          b = a;
          a = c;
        }
      }

      if (a >= 24) {
        if (b < a) {
          a += -24;
        } else {
          a += -24;
          const c = a;
          a = b;
          b = c;
        }
      }
    }

    return [a, b];
  }
}

export default new NotificationPreferencesService();
