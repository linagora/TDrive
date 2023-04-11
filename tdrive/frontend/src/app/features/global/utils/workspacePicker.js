import Observable from 'app/deprecated/CollectionsV1/observable.js';
import Api from 'app/features/global/framework/api-service';

class WorkspacePicker extends Observable {
  constructor() {
    super();
    this.observableName = 'workspacePicker';
    this.searchedWorkspace = null;
    this.refresh = false;
    this.searchInput = '';
    this.searchLabel = '';
    this.isSearching = false;
  }

  getWorkspaceByName(name) {
    var data = {
      name: name,
    };
    this.isSearching = true;
    this.notify();
    var that = this;
    Api.post('/ajax/workspace/getByName', data, function (res) {
      that.searchedWorkspace = res.data.workspace;
      that.isSearching = false;
      that.notify();
    });
  }
}

const wsPicker = new WorkspacePicker();
export default wsPicker;
