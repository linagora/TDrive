/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-explicit-any */
import ws from 'app/deprecated/websocket/websocket';
import Collections from 'app/deprecated/CollectionsV1/Collections/Collections';
import UserService from './current-user-service';
import Globals from 'app/features/global/services/globals-tdrive-app-service';
import userAsyncGet from 'app/features/users/utils/async-get';

type Timeout = ReturnType<typeof setTimeout>;

class ListenUsers {
  users_repository: any;
  connectedPing: { [key: string]: Timeout };
  listenerCount: { [key: string]: number };
  pingTimeouts: { [key: string]: Timeout };
  was_connected_last_check: { [key: string]: boolean };
  lastPong: number;

  constructor() {
    this.users_repository = Collections.get('users');
    this.listenerCount = {};
    this.connectedPing = {};
    this.pingTimeouts = {};
    this.was_connected_last_check = {};
    this.lastPong = 0;
    (Globals.window as any).listenUsers = this;
  }

  /**
   * Check if the given user is active: new Date().getTime() - ws.lastAlive < 1000*60*5
   *
   * @param idUser
   */
  ping(idUser: string): void {
    ws.publish(`users/${idUser}`, {
      ping: true,
      user: { connected: true, id: UserService.getCurrentUserId() },
    });

    if (this.pingTimeouts[idUser]) {
      clearTimeout(this.pingTimeouts[idUser]);
    }

    this.pingTimeouts[idUser] = setTimeout(() => {
      //Only say this to me !
      const user = Collections.get('users').find(idUser);

      if (user) {
        if (user.connected) {
          user.connected = false;
          this.users_repository.updateObject(user);
        }
      }
      this.was_connected_last_check[idUser] = false;
    }, 5000);
  }

  pong(): void {
    this.lastPong = new Date().getTime();

    ws.publish(`users/${UserService.getCurrentUserId()}`, {
      user: { connected: true, id: UserService.getCurrentUserId() },
    });
  }

  listenUser(idUser: string): void {
    if (!idUser) {
      return;
    }

    if (!this.listenerCount[idUser]) {
      this.listenerCount[idUser] = 0;
    }
    this.listenerCount[idUser] += 1;

    const that = this;
    if (this.listenerCount[idUser] === 1) {
      ws.subscribe(
        `users/${idUser}`,
        (_uri: string, data: any) => {
          /*if (idUser == UserServiceImpl.getCurrentUserId()) {
          if (data.ping) {
            that.pong();
          }
        }*/
          if (data.user && data.user.id) {
            /*that.setUserPingTimeout(data.user.id);
          if (data.user.connected && that.pingTimeouts[idUser]) {
            clearTimeout(that.pingTimeouts[idUser]);
          }*/
            if (that.users_repository.find(data.user.id)) {
              that.was_connected_last_check[idUser] = data.user.connected;
              if (
                data.user.username ||
                data.user.notifications_preferences ||
                data.user.connected !== that.users_repository.find(data.user.id).connected
              ) {
                that.users_repository.updateObject(data.user);
              }
            } else if (data.user.id) {
              userAsyncGet(data.user.id);
            }
          }
        },
        null,
      );

      if (idUser !== UserService.getCurrentUserId()) {
        /*setTimeout(() => {
          if (idUser != UserServiceImpl.getCurrentUserId()) {
            this.setUserPingTimeout(idUser);
            this.ping(idUser);
          }
        }, 1000);

        if (new Date().getTime() - this.lastPong > 60000) {
          this.pong();
        }*/
      }
    }
  }

  setUserPingTimeout(idUser: string): void {
    if (this.connectedPing[idUser]) {
      clearTimeout(this.connectedPing[idUser]);
    }

    this.connectedPing[idUser] = setTimeout(() => {
      this.ping(idUser);
      this.setUserPingTimeout(idUser);
    }, 600000);
  }

  cancelListenUser(idUser: string) {
    if (!idUser) {
      return;
    }

    if (this.listenerCount[idUser]) {
      this.listenerCount[idUser] += -1;
    }

    if (!this.listenerCount[idUser] || this.listenerCount[idUser] === 0) {
      ws.unsubscribe(`users/${idUser}`, null, null);

      if (this.connectedPing[idUser]) {
        clearInterval(this.connectedPing[idUser]);
      }
    }
  }
}

const service = new ListenUsers();
(Globals.services as any) = service;

export default service;
