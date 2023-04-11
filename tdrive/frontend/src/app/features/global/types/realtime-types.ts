/* eslint-disable @typescript-eslint/no-explicit-any */
export type WebSocketResource = {
  room: string;
  name?: string;
};

export type RealtimeResources<T> = {
  resources: T[];
  websockets: WebSocketResource[];
};

export type RealtimeApplicationEventAction = 'configure' | 'close_configure';
export type RealtimeEventAction = 'saved' | 'updated' | 'deleted' | 'event';

export type RealtimeBaseAction = RealtimeEventAction | RealtimeApplicationEventAction;

export interface RealtimeBaseEvent {
  action: RealtimeEventAction;
  data?: any;
}

export interface RealtimeResourceEvent<T> extends RealtimeBaseEvent {
  resource: T;
  type?: string;
}

export interface RealtimeEvent<T, U> extends RealtimeBaseEvent {
  room: string;
  path: string;
  type: U;
  resource: T;
}

export interface RealtimeApplicationEvent {
  action: 'configure' | 'close_configure';
  connection_id: string;
  application: unknown;
  form: unknown;
  hidden_data: unknown;
  configurator_id: string;
}
