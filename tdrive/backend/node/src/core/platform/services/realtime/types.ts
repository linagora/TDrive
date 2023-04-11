import { EntityOperationResult } from "../../framework/api/crud-service";

export enum RealtimeEntityActionType {
  Created = "created",
  Saved = "saved",
  Updated = "updated",
  Deleted = "deleted",
  Event = "event",
}

export interface WebsocketRoomSignature {
  name: string; //Ws room name
  sub: string; //User id
  iat: number; //Deadline
}

export class ResourcePath {
  constructor(readonly path: string[] = ["/"], readonly name: string = "default") {}

  static default(): ResourcePath {
    return new ResourcePath();
  }

  static get(path: string | string[]): ResourcePath {
    return new ResourcePath(typeof path === "string" ? [path] : path);
  }
}
export class RealtimeEntityEvent<Entity> {
  // the type of the resource
  type: string;
  // the room to push the resource to
  room: ResourcePath;
  // the unique full path of the resource, ie where we can get it
  resourcePath: string | null;
  // the input resource
  entity: Entity;
  // the action result which fired this event
  result: EntityOperationResult<Entity> | null;
}

export class RealtimeApplicationEvent {
  action: "configure" | "close_configure";
  application: unknown;
  form: unknown;
  hidden_data: unknown;
}

export class RealtimeBaseBusEvent<T> {
  room: string;
  type: string;
  data: T;
}

export class RealtimeLocalBusEvent<Entity> {
  event: RealtimeEntityEvent<Entity>;
  topic: string;
}

export class JoinRoomEvent {
  name: string;
  token?: string;
}

export class LeaveRoomEvent {
  name: string;
}

export class ClientEvent {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export interface JoinLeaveRoomError {
  name: string;
  message?: string;
  type?: string;
}

export interface JoinLeaveRoomSuccess {
  name: string;
  message?: string;
}
