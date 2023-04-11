/* eslint-disable @typescript-eslint/no-explicit-any */
import Observable from 'app/deprecated/Observable/Observable';
import MenusManager from 'app/components/menus/menus-manager.jsx';

class ModalManagerService extends Observable {
  static service: ModalManagerService = new ModalManagerService();
  private component: any[] = [];
  private popupStates: any = {};
  private position: any = null;
  private mountedComponent: any = null;
  private closing = false;
  private creationTimeout: any = null;

  getPosition() {
    return this.position;
  }

  updateHighlight(highlight: any) {
    if (this.position) this.position.highlight = highlight;
    this.notify();
  }

  open(component: any, position: any, canClose?: boolean, clearState?: any) {
    this.close();

    this.mountedComponent = null;

    this.creationTimeout && clearTimeout(this.creationTimeout);
    this.creationTimeout = setTimeout(() => {
      this.component = [];
      this.position = position || {};
      MenusManager.closeMenu();
      if (clearState) {
        delete this.popupStates[clearState];
      }
      this.component.push({ component: component, canClose: canClose !== false });
      this.notify();
    }, 100);
  }

  isOpen() {
    return this.component.length > 0;
  }

  close() {
    if (this.closing) {
      return false;
    }
    if (this.isOpen()) {
      this.closing = true;
      (this.mountedComponent || {}).onMediumPopupClose &&
        this.mountedComponent.onMediumPopupClose();

      this.mountedComponent = null;
      this.component.splice(-1, 1);
      this.notify();
      this.closing = false;
    }
  }
  closeAll() {
    if (this.isOpen()) {
      (this.mountedComponent || {}).onMediumPopupClose &&
        this.mountedComponent.onMediumPopupClose();

      this.mountedComponent = null;
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
    return this.component[this.component.length - 1]?.component || '';
  }
}

const ModalManager = ModalManagerService.service;
export default ModalManager;
