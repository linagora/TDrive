import Number from 'app/features/global/utils/Numbers';
import Observable from 'app/deprecated/CollectionsV1/observable.js';
import LoginService from 'app/features/auth/login-service';
import Logger from 'app/features/global/framework/logger-service';
import Globals from 'app/features/global/services/globals-tdrive-app-service';
import WebSocket from '../../features/global/types/websocket-types';

/**
 * @deprecated Keeps old PHP websocket working doing the bridge with the new implementation
 */
class DeprecatedWebsocket extends Observable {
  constructor() {
    super();
    this.logger = Logger.getLogger('Websocket');
    this.setObservableName('websockets');

    this.ws = null;
    this.connection = null;
    this.afterError = false;
    this.lastData = 1;
    this.testNetwork = false;

    this.connected = true;
    this.subscribed = {};
    this.subscribedKey = {};
    this.disconnectListeners = {};

    this.alive_connected = true;

    this.firstTime = true;
    this.last_reconnect_call = new Date();
    this.last_reconnect_call_if_needed = new Date();

    window.websocketsManager = this;

    this.window_focus = true;
    this.window_last_blur = new Date();
    this.deconnectionBlurTimeout = setTimeout(() => {}, 0);
    Globals.window.addEventListener('focus', () => {
      this.reconnectIfNeeded(60);
      clearTimeout(this.deconnectionBlurTimeout);
      this.didFocusedLastMinute = true;
      this.window_focus = true;
      this.window_last_blur = new Date();
      if (this.ws == null || new Date().getTime() - this.window_last_blur.getTime() > 30000) {
        this.alive_connected = false;
        this.alive();
      }
    });
    Globals.window.addEventListener('blur', () => {
      this.window_focus = false;
      this.window_last_blur = new Date();
    });

    this.alive.bind(this);
    this.message.bind(this);
    this.updateConnected.bind(this);
  }

  //Send I'm alive !
  alive() {
    var nw = new Date().getTime();
    if (!this.lastAlive || nw - this.lastAlive > 60000) {
      // Wait at least 60 seconds
      this.lastAlive = nw;
      this.alive_timeout = setTimeout(() => {
        this.alive_connected = false;
      }, 5100);
      this.reconnectIfNeeded();
      clearTimeout(this.alive_timeout);
      this.alive_connected = true;
      this.didFocusedLastMinute = Globals.isReactNative || Globals.window.document.hasFocus();
    }
  }

  //Receive server message
  message(unid, route, data) {
    route = (route || '').split('previous::').pop();
    if (unid !== this.subscribedKey[route]) {
      return;
    }
    if (this.subscribed[route]) {
      this.subscribed[route].forEach(c => {
        try {
          c.callback(route, data);
        } catch (err) {
          console.log(err);
        }
      });
    } else {
      this.unsubscribe(route);
    }
  }

  //Subscribe to channel
  subscribe(route, callback, key) {
    this.logger.debug(`Subscribe to ${route}`);
    route = (route || '').split('previous::').pop();
    if (!key) {
      key = callback.name;
    }
    if (!this.subscribed[route]) {
      this.subscribed[route] = [];
    }
    this.subscribed[route].push({ name: key, callback: callback });
    if (this.subscribed[route].length === 1) {
      const unid = Number.unid();
      this.subscribedKey[route] = unid;
      WebSocket.get().join('previous::' + route, '', '', (type, data) => {
        if (type === 'realtime:event') {
          this.message(unid, data.name, data.data);
        }
        if (type === 'connected') {
          this.updateConnected(true);
        }
        if (type === 'disconnected') {
          this.updateConnected(false);
        }
      });
    }
  }

  //Unsubscribe from channel
  unsubscribe(route, callback, key) {
    this.logger.debug(`Unsubscribe from ${route}`);
    route = (route || '').split('previous::').pop();
    if (!key && callback) {
      key = callback.name;
    }
    if (!key) {
      key = 'default';
    }
    if (!this.subscribed[route]) {
      this.subscribed[route] = [];
    }
    var remaining = [];
    this.subscribed[route].forEach(c => {
      if (c.name !== key) {
        remaining.push(c);
      }
    });
    this.subscribed[route] = remaining;
    if (this.subscribed[route].length === 0) {
      WebSocket.get().leave('previous::' + route, '');
    }
  }

  publish(route, value) {
    this.logger.debug(`Publish to ${route}`);
    WebSocket.get().send('previous::' + route, value);
  }

  reconnectIfNeeded(seconds = 30) {
    if (new Date().getTime() - this.last_reconnect_call_if_needed.getTime() > seconds * 1000) {
      //30 seconds
      if (LoginService.currentUserId) {
        LoginService.updateUser();
      }

      this.last_reconnect_call_if_needed = new Date();
    }
  }

  onReconnect(id, callback) {
    this.disconnectListeners[id] = callback;
  }

  offReconnect(id) {
    delete this.disconnectListeners[id];
  }

  updateConnected(state) {
    if (state !== this.connected) {
      this.connected = state;
      this.notify();
    }
  }

  isConnected() {
    return this.connected;
  }
}

export default new DeprecatedWebsocket();
