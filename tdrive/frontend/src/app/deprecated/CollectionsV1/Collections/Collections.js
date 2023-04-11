import Collection from './Collection';

class Collections {
  constructor() {
    this.collections = {};
    window.dcollections = this;
  }

  clearAll() {
    this.collections = {};
  }

  get(entity, options = null) {
    if (!this.collections[entity]) {
      var manager = new Collection();
      manager.setObservableName(entity + '_repository');
      this.collections[entity] = {
        manager: manager,
      };
    }
    return this.collections[entity].manager;
  }

  updateOptions(entity, updated) {
    if (!this.collections[entity]) {
      console.log('Warning : no collection created in updateOptions !');
      return;
    }

    Object.keys(updated).forEach(key => {
      this.collections[entity].manager[key] = updated[key];
    });

    this.collections[entity].manager.updatedOptions();
  }

  printUsage() {
    Object.keys(this.collections).forEach(key => {
      console.log(
        '-',
        key,
        'observable size:',
        this.collections[key].manager.observableListenersList.length,
      );
    });
  }

  watchUsage(ms = 2000) {
    return setInterval(() => this.printUsage(), ms);
  }
}

export { Collections, Collection };

export default new Collections();
