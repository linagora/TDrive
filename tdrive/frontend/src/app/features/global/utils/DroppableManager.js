import $ from 'jquery';

class DroppableManager {
  constructor() {
    this.drop = {};
    this.draggingData = {};
    this.dragging = false;
  }

  over(key, callback, event) {
    this.drop[key] = {
      callback: callback,
      element: event.target,
    };
  }

  out(key) {
    this.drop[key] = undefined;
    delete this.drop[key];
  }

  up() {
    var that = this;
    if (!that.draggingData.type || !that.draggingData.data || that.draggingData.data.length == 0) {
      return;
    }
    if (!this.dragging) {
      return;
    }
    this.drop.forEach(el => {
      if (el && el.callback) {
        el.callback(that.draggingData);
      }
    });
  }
}

const instanceDroppableManager = new DroppableManager();
export default instanceDroppableManager;
