import Observable from 'app/deprecated/CollectionsV1/observable.js';
import MenusManager from 'app/components/menus/menus-manager.jsx';
import WindowService from 'app/features/global/utils/window';

import Globals from 'app/features/global/services/globals-tdrive-app-service';

class PopupService extends Observable {
  constructor() {
    super();
    this.setObservableName('popupService');
    Globals.window.popupService = this;
    this.component = []; // element as {component,canClose}
    this.popupStates = {};
  }
  open(component, canClose, key = 'no-key') {
    if (this.component[this.component.length - 1]?.key === key) {
      return;
    }
    if (key !== 'no-key') {
      delete this.popupStates[key];
    }
    WindowService.setSuffix();
    MenusManager.closeMenu();

    this.component.push({ component: component, key: key, canClose: canClose !== false });
    this.notify();
  }
  isOpen() {
    return this.component.length > 0;
  }
  close() {
    if (this.isOpen()) {
      this.component.splice(-1, 1);
      this.notify();
    }
  }
  closeAll() {
    if (this.isOpen()) {
      this.component = [];
      this.notify();
    }
  }
  canClose() {
    if (this.isOpen()) {
      return this.component[this.component.length - 1].canClose;
    }
    return null;
  }
  getComponent() {
    if (this.isOpen()) {
      return this.component[this.component.length - 1].component;
    }
    return null;
  }
}

Globals.services.popupService = Globals.services.popupService || new PopupService();
export default Globals.services.popupService;
