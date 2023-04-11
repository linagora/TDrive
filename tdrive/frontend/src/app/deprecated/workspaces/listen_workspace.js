import ws from 'app/deprecated/websocket/websocket.js';
import Collections from 'app/deprecated/CollectionsV1/Collections/Collections.js';

class ListenWorkspace {
  constructor() {
    this.workspaces_repository = Collections.get('workspaces');
    this.listenerCount = {};
  }

  listenWorkspace(idWorkspace) {
    if (!idWorkspace) {
      return;
    }

    if (!this.listenerCount[idWorkspace]) {
      this.listenerCount[idWorkspace] = 0;
    }
    this.listenerCount[idWorkspace] += 1;

    var that = this;
    if (this.listenerCount[idWorkspace] === 1) {
      ws.subscribe('workspace/' + idWorkspace, function (uri, data) {
        if (data.workspace) {
          data.workspace.id = idWorkspace;
          that.workspaces_repository.updateObject(data.workspace);
        }
      });
    }
  }

  cancelListenWorkspace(idWorkspace) {
    if (!idWorkspace) {
      return;
    }

    if (this.listenerCount[idWorkspace]) {
      this.listenerCount[idWorkspace] += -1;
    }
    if (!this.listenerCount[idWorkspace] || this.listenerCount[idWorkspace] === 0) {
      ws.unsubscribe('workspace/' + idWorkspace);
    }
  }
}

const service = new ListenWorkspace();
export default service;
