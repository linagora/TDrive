import Languages from 'app/features/global/services/languages-service';
import Observable from 'app/deprecated/CollectionsV1/observable.js';
import ws from 'app/deprecated/websocket/websocket.js';
import Api from 'app/features/global/framework/api-service';
import Login from 'app/features/auth/login-service';
import Collections from 'app/deprecated/CollectionsV1/Collections/Collections.js';
import AlertManager from 'app/features/global/services/alert-manager-service';

import Globals from 'app/features/global/services/globals-tdrive-app-service';

/**
 * FIXME: This service seems still used by some components but we now have ./NotificationPreferences one which seems to overlap...
 */
class NotificationParameters extends Observable {
  constructor() {
    super();
    this.setObservableName('notifications_parameters');

    Globals.window.notificationsParametersServices = this;

    this.preferences = {};
    this.loading = true;
  }

  initFirstTime() {
    //Save default 'do not disturb' with correct timezone
    this.init();
  }

  init(callback) {
    this.loading = true;
    this.notify();
    var that = this;
    Api.post('/ajax/users/account/get_notifications', {}, function (res) {
      that.preferences = res.data;
      that.original_preferences = JSON.parse(JSON.stringify(that.preferences));

      if (that.preferences['dont_disturb_between'] == null) {
        var l = that.transform_period(22, 8.5, new Date().getTimezoneOffset() / 60);
        that.preferences['dont_disturb_between'] = l[0];
        that.preferences['dont_disturb_and'] = l[1];
        that.save(['dont_disturb_and', 'dont_disturb_between']);
      }

      that.loading = false;
      that.notify();

      if (callback) callback();
    });
  }

  save(keys, no_notif) {
    if (!keys) {
      keys = [];
    }

    if (!this.preferences) {
      return;
    }

    if (!keys || keys.length === 0) {
      this.original_preferences = JSON.parse(JSON.stringify(this.preferences));
    }

    this.notify();
    var data = {
      preferences: JSON.parse(JSON.stringify(this.original_preferences)),
    };

    keys.forEach(key => {
      data.preferences[key] = this.preferences[key];
    });
    this.original_preferences = data.preferences;

    this.saveElements(data.preferences, no_notif);
  }

  saveElements(pref, no_notif) {
    var data = {
      preferences: JSON.parse(JSON.stringify(pref)),
    };
    var user = Collections.get('users').find(Login.currentUserId);
    if (!user.notifications_preferences) {
      user.notifications_preferences = {};
    }
    Object.keys(pref).forEach(key => {
      user.notifications_preferences[key] = pref[key];
    });
    Collections.get('users').updateObject(user);

    this.loading = true;
    var that = this;
    Api.post('/ajax/users/account/set_notifications', data, function (res) {
      that.loading = false;
      ws.publish('users/' + Login.currentUserId, {
        user: {
          notifications_preferences: Collections.get('users').find(Login.currentUserId)
            .notifications_preferences,
        },
      });
      that.notify();

      if (!no_notif) {
        AlertManager.alert(() => {}, {
          text: Languages.t(
            'services.user.notification_parameters_update_alert',
            [],
            'Les paramètres de notification ont été mis à jour.',
          ),
        });
      }
    });
  }

  is_in_period(a, b) {
    var currentDate = new Date().getHours() + Math.floor(new Date().getMinutes() / 30) / 2;
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

  hasNotificationsDisabled(preferences) {
    if (!preferences) {
      return false;
    }
    var l = this.transform_period(
      preferences.dont_disturb_between,
      preferences.dont_disturb_and,
      -new Date().getTimezoneOffset() / 60,
    );
    if (this.is_in_period(l[0], l[1])) {
      return true;
    }
    if (preferences.disable_until > new Date().getTime() / 1000) {
      return true;
    }
    return false;
  }

  getNotificationsStatus(user) {
    this.dont_disturb = this.transform_period(
      (user.notifications_preferences || {}).dont_disturb_between,
      (user.notifications_preferences || {}).dont_disturb_and,
      -new Date().getTimezoneOffset() / 60,
    );
    var notifications_state = 'on';
    if (
      (user.notifications_preferences || {}).disable_until < new Date().getTime() / 1000 &&
      !this.is_in_period(this.dont_disturb[0], this.dont_disturb[1])
    ) {
      notifications_state = 'on';
    } else if (
      (user.notifications_preferences || {}).disable_until <
        new Date().getTime() / 1000 + 60 * 60 * 24 ||
      this.is_in_period(this.dont_disturb[0], this.dont_disturb[1])
    ) {
      notifications_state = 'paused';
    } else {
      notifications_state = 'off';
    }
    return notifications_state;
  }

  transform_period(a, b, offset) {
    a = parseFloat(a);
    b = parseFloat(b);

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
          var c = b;
          b = a;
          a = c;
        }
      }

      if (a >= 24) {
        if (b < a) {
          a += -24;
        } else {
          a += -24;
          // eslint-disable-next-line no-redeclare
          var c = a;
          a = b;
          b = c;
        }
      }
    }

    return [a, b];
  }
}

export default new NotificationParameters();
