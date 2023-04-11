import ws from 'app/deprecated/websocket/websocket.js';
import Collections from 'app/deprecated/CollectionsV1/Collections/Collections.js';

class ListenGroups {
  constructor() {
    this.groups_repository = Collections.get('groups');
    this.listenerCount = {};
  }

  listenGroup(idGroup) {
    if (!idGroup) {
      return;
    }

    if (!this.listenerCount[idGroup]) {
      this.listenerCount[idGroup] = 0;
    }
    this.listenerCount[idGroup] += 1;

    var that = this;
    if (this.listenerCount[idGroup] === 1) {
      ws.subscribe('group/' + idGroup, function (uri, data) {
        data = data.data;
        if (data.group) {
          data.group.id = idGroup;
          that.groups_repository.updateObject(data.group);
        }
      });
    }
  }

  cancelListenGroup(idGroup) {
    if (!idGroup) {
      return;
    }

    if (this.listenerCount[idGroup]) {
      this.listenerCount[idGroup] += -1;
    }
    if (!this.listenerCount[idGroup] || this.listenerCount[idGroup] === 0) {
      ws.unsubscribe('group/' + idGroup);
    }
  }
}

const service = new ListenGroups();
export default service;
