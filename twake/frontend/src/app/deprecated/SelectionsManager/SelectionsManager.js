import Observable from 'app/deprecated/CollectionsV1/observable.js';

import Globals from 'app/features/global/services/globals-tdrive-app-service';

class SelectionsManager extends Observable {
  constructor() {
    super();
    this.setObservableName('selections_manager');

    this.type = '';
    this.selected_per_type = {};
    this.last_change = {};

    Globals.window.selected_drive = this;
  }

  toggle(id) {
    if (this.selected_per_type[this.type][id]) {
      this.unselect(id);
    } else {
      this.select(id);
    }
  }

  select(id) {
    this.selected_per_type[this.type][id] = true;
    this.last_change[id] = new Date();
    this.notify();
  }

  unselect(id) {
    delete this.selected_per_type[this.type][id];
    this.last_change[id] = new Date();
    this.notify();
  }

  unselectAll() {
    if (Object.keys(this.selected_per_type[this.type] || {}).length === 0) {
      return;
    }
    Object.keys(this.selected_per_type[this.type] || {}).forEach(id => {
      this.last_change[id] = new Date();
    });
    this.selected_per_type[this.type] = {};
    this.notify();
  }

  setType(type) {
    if (type !== this.type) {
      this.type = type;
      if (!this.selected_per_type[this.type]) {
        this.selected_per_type[this.type] = {};
      }
    }
  }

  //Observable improvement, a listener can listen only for modifications on some objects to prevent massive notify and state updates
  listenOnly(listener, object_front_ids) {
    if (!listener._observable) {
      listener._observable = {};
    }
    if (!listener._observable[this.observableName]) {
      listener._observable[this.observableName] = {};
    }
    listener._observable[this.observableName].listen_only = object_front_ids;
  }
  shouldNotify(node) {
    if (!this._last_modified) {
      this._last_modified = {};
    }
    var update = true;
    if (
      node._observable &&
      node._observable[this.observableName] &&
      node._observable[this.observableName].listen_only
    ) {
      update = false;
      // eslint-disable-next-line array-callback-return
      node._observable[this.observableName].listen_only.map(item => {
        if (!this._last_modified[item] || this.last_change[item] > this._last_modified[item]) {
          this._last_modified[item] = this.last_change[item];
          update = true;
        }
      });
    }
    return update;
  }
}

const service = new SelectionsManager();
export default service;
