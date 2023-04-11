/* eslint-disable @typescript-eslint/no-explicit-any */
import io from 'socket.io-client';
import { EventEmitter } from 'events';
import Logger from 'app/features/global/framework/logger-service';
import { WebsocketEvents, WebSocketListener, WebsocketRoomActions } from '../types/websocket-types';
import { Maybe } from 'app/features/global/types/global-types';

export type WebSocketOptions = {
  url: string;
  authenticateHandler: () => Promise<any>;
};

const CONNECT_TIMEOUT = 30000;

class WebSocketService extends EventEmitter {
  private logger: Logger.Logger;
  private lastConnection = 0;
  private wsListeners: {
    [path: string]: { [tag: string]: WebSocketListener };
  } = {};
  private socket: SocketIOClient.Socket | null = null;
  private connectTimeout?: ReturnType<typeof setTimeout>;

  constructor(private options: WebSocketOptions) {
    super();
    this.logger = Logger.getLogger('WebsocketService');
    this.addEventListeners();
  }

  private addEventListeners(): void {
    const reconnectWhenNeeded = () => {
      if (!this.isConnected()) {
        this.connect();
      }
    };

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        reconnectWhenNeeded();
      }
    });

    document.addEventListener('focus', () => {
      reconnectWhenNeeded();
    });

    setInterval(() => {
      if (new Date().getTime() - this.lastConnection > CONNECT_TIMEOUT) {
        this.lastConnection = new Date().getTime();
        reconnectWhenNeeded();
      }
    }, CONNECT_TIMEOUT);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  async connect(): Promise<boolean> {
    let connected: (value: boolean) => void;
    const promise = new Promise<boolean>(resolve => {
      connected = resolve;
    });

    if (!this.options.url) {
      this.logger.info('Skipping connect to empty URL');
      return false;
    }

    this.logger.debug('Connecting to websocket', this.options.url);

    if (this.socket) {
      if (this.socket.connected) {
        this.logger.debug('Already connected to', this.options.url);
        return false;
      } else {
        this.socket?.close();
        this.socket = null;
      }
    }

    if (!this.options.authenticateHandler) {
      this.logger.error('Cannot connect without an authentication method');
      return false;
    }

    this.socket = io.connect(this.options.url || '', {
      path: '/socket',
      reconnectionDelayMax: 10000,
      reconnectionDelay: 2000,
    });

    this.socket.on('disconnect', () => {
      this.logger.debug('Disconnected from websocket, socket.io will reconnect');
    });

    this.socket.on('connect', async () => {
      this.logger.debug('Connected to websocket, authenticating...');
      if (this.connectTimeout) {
        clearTimeout(this.connectTimeout);
      }

      this.socket
        ?.emit('authenticate', (await this.options.authenticateHandler()) || {})
        .on('authenticated', () => {
          this.logger.debug('Authenticated');
          this.rejoinAll(true);
          connected(true);
          this.emit(WebsocketEvents.Connected, { url: this.options.url });
        })
        .on('unauthorized', (err: any) => {
          this.logger.warn('Websocket is not authorized', err);
          this.socket?.close();
          this.socket = null;
          //Retry and expect new jwt
          this.connectTimeout = setTimeout(async () => {
            const isConnected = await this.connect();
            if (isConnected) {
              connected(true);
            }
          }, 1000);
        });

      this.socket?.on(WebsocketEvents.JoinSuccess, (event: any) => {
        this.logger.debug('Websocket join success', event.name);
        event.name && this.notify(event.name, WebsocketEvents.JoinSuccess, event);
      });

      this.socket?.on(WebsocketEvents.JoinError, (event: any) => {
        this.logger.debug('Websocket join error', event.name);
        event.name && this.notify(event.name, WebsocketEvents.JoinError, event);
      });

      this.socket?.on(WebsocketEvents.Resource, (event: any) => {
        this.logger.debug('Received resource on room', event.room, event);
        event.room && this.notify(event.room, WebsocketEvents.Resource, event);
      });

      this.socket?.on(WebsocketEvents.Event, (event: any) => {
        this.logger.debug('New Websocket event', event.name);
        event.name && this.notify(event.name, WebsocketEvents.Event, event);
      });

      this.socket?.on('disconnect', () => {
        this.emit(WebsocketEvents.Disconnected, { url: this.options.url });
      });
    });

    return promise;
  }

  private rejoinAll(newlyConnected = false) {
    Object.keys(this.wsListeners).forEach(key => {
      Object.keys(this.wsListeners[key]).forEach(tag => {
        if (this.wsListeners[key][tag]) {
          newlyConnected && this.wsListeners[key][tag].callback(WebsocketEvents.Connected, {});
          this.join(
            key,
            this.wsListeners[key][tag].token,
            tag,
            this.wsListeners[key][tag].callback,
          );
        }
      });
    });
  }

  private notify(path: string, type: WebsocketEvents, event: any) {
    if (this.wsListeners[path]) {
      Object.values(this.wsListeners[path]).forEach(callback => callback.callback?.(type, event));
    }
  }

  public getSocket(): SocketIOClient.Socket | null {
    return this.socket;
  }

  /**
   * Join a room. callback will be called when a message is received on the given room
   *
   * @param path
   * @param tag
   * @param callback
   */
  public join(
    path: string,
    token: string,
    tag: string,
    callback: (type: WebsocketEvents, event: any) => void,
  ) {
    const name = path.replace(/\/$/, '');

    this.logger.debug(`Join room with name='${name}' and tag='${tag}'`);

    if (this.socket) {
      this.socket.emit(WebsocketRoomActions.Join, { name, token });
    }

    this.wsListeners[name] = this.wsListeners[name] || {};
    this.wsListeners[name][tag] = { token, callback };
  }

  /**
   * Leave a room
   *
   * @param path
   * @param tag
   */
  public leave(path: string, tag: string) {
    const name = path.replace(/\/$/, '');

    this.wsListeners[name] = this.wsListeners[name] || {};
    delete this.wsListeners[name][tag];

    if (Object.keys(this.wsListeners[name]).length === 0) {
      if (this.socket) {
        this.logger.debug(`Leave room with name='${name}' and tag='${tag}'`);
        this.socket.emit(WebsocketRoomActions.Leave, { name });
      }
      delete this.wsListeners[name];
    }
  }

  /**
   * Send data as {name: path, data} in the realtime:event topic.
   *
   * @param path
   * @param data
   */
  public send<T>(path: string, token: string, data: T): void {
    const name = path.replace(/\/$/, '');
    this.logger.debug(`Send realtime:event with name='${name}'`);

    if (this.socket) {
      this.socket.emit('realtime:event', { name, data, token });
    }
  }

  public async get<Request, Response>(
    route: string,
    request: Request,
    callback?: (response: Response) => void,
  ): Promise<Maybe<Response>> {
    this.logger.debug(`Get ${route}`);

    return new Promise<Maybe<Response>>(resolve => {
      if (this.socket) {
        this.socket.emit(route, { data: request }, (response: { data: Response }) => {
          this.logger.trace('Got a socket ack');
          const result = response.data;
          callback && callback(result);
          resolve(result);
        });

        return;
      }
    });
  }
}

export default WebSocketService;
