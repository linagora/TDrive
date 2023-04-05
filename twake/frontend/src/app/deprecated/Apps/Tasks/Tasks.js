import Observable from 'app/deprecated/CollectionsV1/observable.js';
import Globals from 'app/features/global/services/globals-tdrive-app-service';
import Collections from 'app/deprecated/CollectionsV1/Collections/Collections.js';
import MediumPopupManager from 'app/components/modal/modal-manager';
import Workspaces from 'app/deprecated/workspaces/workspaces.jsx';
import Api from 'app/features/global/framework/api-service';
import AlertManager from 'app/features/global/services/alert-manager-service';

class Tasks extends Observable {
  constructor() {
    super();
    this.setObservableName('app_tasks_service');

    this.current_board_by_workspace = {};
    this.paused_notify = {};
    this.index_calculation_pools = {};

    Globals.window.tasks = this;
  }

  openBoard(id) {
    this.current_board_by_workspace[Workspaces.currentWorkspaceId] = id;
    this.notify();
  }

  remove(task, collectionKey) {
    AlertManager.confirm(() => {
      Collections.get('tasks').remove(task, collectionKey);
      MediumPopupManager.closeAll();
    });
    if (task.front_id === (this.edited || {}).front_id) {
      this.edited = null;
    }
  }

  archive(task, collectionKey) {
    task.archived = true;
    Collections.get('tasks').save(task, collectionKey);
    MediumPopupManager.closeAll();
  }

  unarchive(task, collectionKey) {
    task.archived = false;
    Collections.get('tasks').save(task, collectionKey);
    MediumPopupManager.closeAll();
  }

  archiveAllTasksInList(list, collectionKey) {
    var options = {};
    AlertManager.confirm(() => {
      Api.post('/ajax/tasks/list/tasks/archive', { object: list, options: options }, () => {});
    });
  }

  removeAllTasksInList(list, only_archived_tasks, collectionKey) {
    var options = {
      only_archived_tasks: only_archived_tasks,
    };
    AlertManager.confirm(() => {
      Api.post('/ajax/tasks/list/tasks/remove', { object: list, options: options }, () => {});
    });
  }

  setElementIndexPool(key, pool) {
    this.index_calculation_pools[key] = pool
      .map(item => item.order)
      .sort((a, b) => {
        return (a || '').localeCompare(b || '');
      });
  }

  getElementIndex(element, key) {
    if (!this.index_calculation_pools[key]) {
      this.index_calculation_pools[key] = [];
    }
    return this.index_calculation_pools[key].indexOf(element.order) || 0;
  }

  newIndexAfter(key, index) {
    if (index === undefined) {
      index = this.index_calculation_pools[key].length - 1;
    }
    var value = this.index_calculation_pools[key][index] || '';
    var next_value = this.index_calculation_pools[key][index + 1] || '';
    var letters = '0abcdefghijklmnopqrstuvwxyz'.split('');

    // eslint-disable-next-line no-extend-native
    String.prototype.replaceAt = function (index, replacement) {
      return this.substr(0, index) + replacement + this.substr(index + replacement.length);
    };

    var found = false;
    var i = 0;
    while (!found) {
      if (!value[i]) {
        value = value.replaceAt(i, 'a');
      }
      if (!next_value[i]) {
        next_value = next_value.replaceAt(i, 'z');
      }
      var diff = parseInt((letters.indexOf(next_value[i]) - letters.indexOf(value[i])) / 2);
      if (diff === 0) {
        i++;
      } else {
        value = value.replaceAt(i, letters[letters.indexOf(value[i]) + diff]);
        return value.slice(0, i + 1);
      }
    }
  }

  getTasksInList(board_id, list_id, archived) {
    if (!list_id) {
      return [];
    }
    if (list_id.split('_')[0] === 'allusertasks') {
      var filter = {};
      if (archived !== undefined) {
        filter.archived = archived ? true : false;
      }
      return Collections.get('tasks')
        .findBy(filter)
        .filter(a => {
          if (a.participants.map(b => b.user_id_or_mail).indexOf(list_id.split('_')[1]) >= 0) {
            return true;
          }
          return false;
        });
    }
    if (list_id.split('_')[0] === 'workspaceusertasks') {
      // eslint-disable-next-line no-redeclare
      var filter = { workspace_id: list_id.split('_')[2] };
      if (archived !== undefined) {
        filter.archived = archived ? true : false;
      }
      return Collections.get('tasks')
        .findBy(filter)
        .filter(a => {
          if (a.participants.map(b => b.user_id_or_mail).indexOf(list_id.split('_')[1]) >= 0) {
            return true;
          }
          return false;
        });
    }
    // eslint-disable-next-line no-redeclare
    var filter = { board_id: board_id, list_id: list_id };
    if (archived !== undefined) {
      filter.archived = archived ? true : false;
    }
    return Collections.get('tasks').findBy(filter);
  }
}

const service_tasks = new Tasks();
export default service_tasks;
