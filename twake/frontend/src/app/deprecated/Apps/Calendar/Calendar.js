import Languages from 'app/features/global/services/languages-service';
import Observable from 'app/deprecated/CollectionsV1/observable.js';
import Globals from 'app/features/global/services/globals-tdrive-app-service';
import Collections from 'app/deprecated/CollectionsV1/Collections/Collections.js';
import MediumPopupManager from 'app/components/modal/modal-manager';
import Workspaces from 'app/deprecated/workspaces/workspaces.jsx';
import Api from 'app/features/global/framework/api-service';
import UserService from 'app/features/users/services/current-user-service';

class Calendar extends Observable {
  constructor() {
    super();
    this.setObservableName('app_calendar_service');

    Globals.window.calendarService = this;

    this.preview = null;
    this.edited = null;
    this.last_used_calendar = {};
    this.date = new Date();

    this.generateMenu();
    this.event_types_by_value = {};
    this.event_types.map(item => {
      return (this.event_types_by_value[item.value] = item);
    });
  }

  generateMenu() {
    this.event_types = [
      {
        icon: 'calender',
        text: Languages.t('services.apps.calendar.event_icon', [], 'Événement'),
        value: 'event',
      },
      {
        icon: 'car-sideview',
        text: Languages.t('services.apps.calendar.move_icon', [], 'Déplacement'),
        value: 'move',
      },
      {
        icon: 'stopwatch-slash',
        text: Languages.t('services.apps.calendar.deadline_icon', [], 'Deadline'),
        value: 'deadline',
      },
      {
        icon: 'stopwatch',
        text: Languages.t('services.apps.calendar.reminder_icon', [], 'Rappel'),
        value: 'remind',
      },
    ];
  }

  setDate(date) {
    this.date = date;
    this.notify();
  }

  edit(_event) {
    this.generateMenu();
    this.closePopups();

    this.edited = Collections.get('events').edit(_event.front_id ? _event : {});

    _event.front_id = this.edited.front_id;
    this.edited = Collections.get('events').completeObject(_event, this.edited.front_id);

    if (!this.edited.id) {
      if (!this.edited.notifications) {
        this.edited.notifications = [];
        this.edited.notifications.push({
          mode: 'push',
          delay: 60 * 30,
        });
      }

      if (!this.edited.participants) {
        this.edited.participants = [];
        this.edited.participants.push({
          user_id_or_mail: UserService.getCurrentUserId(),
        });
      }

      if (!this.edited.workspaces_calendars && this.filter_mode === 'workspace') {
        if (!this.last_used_calendar[Workspaces.currentWorkspaceId]) {
          var tmp = Collections.get('calendars').findBy({
            workspace_id: Workspaces.currentWorkspaceId,
          })[0];
          if (tmp) {
            this.last_used_calendar[Workspaces.currentWorkspaceId] = {
              calendar_id: tmp.id,
              workspace_id: tmp.workspace_id,
            };
          }
        }
        var workspace_calendar = this.last_used_calendar[Workspaces.currentWorkspaceId];

        if (workspace_calendar) {
          this.edited.workspaces_calendars = [];
          this.edited.workspaces_calendars.push({
            calendar_id: workspace_calendar.calendar_id,
            workspace_id: workspace_calendar.workspace_id,
          });
        }
      }
    }

    this.preview = this.edited;
    Collections.get('events').notify();
    this.notify();
  }

  saveEdit(collectionKey) {
    if (!this.edited) {
      return;
    }
    var event = this.edited;
    this.edited = null;
    this.save(event, collectionKey);
    this.closePopups();
  }

  startPreview(event) {
    this.closePopups();
    this.preview = Collections.get('events').findByFrontId(event.front_id) || event;
  }

  closePopups() {
    this.preview = null;
    if (this.edited) {
      Collections.get('events').cancelEdit(this.edited);
      this.edited = null;
    }
    MediumPopupManager.close();
  }

  remove(event, collectionKey) {
    this.closePopups();
    Collections.get('events').remove(event, collectionKey);
  }

  save(event, collectionKey) {
    if (!event.front_id) {
      return;
    }
    event = Collections.get('events').completeObject(event, event.front_id);

    if (event.workspaces_calendars && event.workspaces_calendars.length > 0) {
      this.last_used_calendar[Workspaces.currentWorkspaceId] = event.workspaces_calendars[0];
    }

    if (!this.edited || event.front_id !== this.edited.front_id) {
      Collections.get('events').save(event, collectionKey);
    } else {
      Collections.get('events').notify();
    }
    return event;
  }

  export(workspace_id, calendars, download, callback) {
    Api.post(
      '/ajax/calendar/token_export',
      { workspace_id: workspace_id, calendars: calendars },
      res => {
        if (download) {
          document.location = Api.route('/ajax/calendar/export?token=' + res.token);
        } else {
          if (callback) callback(Api.route('/ajax/calendar/export?token=' + res.token));
        }
      },
    );
  }

  getIsReadonly(event) {
    event = Collections.get('events').findByFrontId(event.front_id) || event;
    if (!event.id) {
      return false;
    }
    var readonly = event.readonly;
    if (event.owner && event.owner !== UserService.getCurrentUserId()) {
      readonly = true;
    }
    (event.workspaces_calendars || []).forEach(item => {
      if (item.workspace_id !== Workspaces.currentWorkspaceId) {
        readonly = true;
      }
    });
    return readonly;
  }
}

const service = new Calendar();
export default service;
