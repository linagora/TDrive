import { ResourcePath } from "../../../../../core/platform/services/realtime/types";
import { EntityTarget, ExecutionContext } from "../../api/crud-service";

export * from "./created";
export * from "./deleted";
export * from "./updated";
export * from "./saved";

export type RealtimeRecipients<T> =
  | RealtimeRecipient<T>
  | RealtimeRecipient<T>[]
  | ((type: T, context?: ExecutionContext) => RealtimeRecipient<T>[] | RealtimeRecipient<T>);

export type RealtimeRecipient<T> = {
  room: RealtimePath<T>;
  path?: string;
  resource?: any | T;
};

export function getRealtimeRecipients<T>(
  recipients: RealtimeRecipients<T>,
  type: T,
  context?: ExecutionContext,
): RealtimeRecipient<T>[] {
  if (typeof recipients === "function") recipients = recipients(type, context);
  if (!recipients) return [];
  if (!(recipients as RealtimeRecipient<T>[]).length)
    recipients = [recipients as RealtimeRecipient<T>];

  return (recipients as RealtimeRecipient<T>[]).map(recipient => {
    return {
      resource: recipient.resource || type,
      path: recipient.path || "/",
      room: recipient.room,
    };
  });
}

export type RealtimePath<T> = string | ResourcePath | ResourcePathResolver<T>;
export interface ResourcePathResolver<T> {
  (type: T, context?: ExecutionContext): ResourcePath;
}
export interface PathResolver<T> {
  (type: T, context?: ExecutionContext): string;
}

export type RealtimeEntity<T> = null | ((type: T, context?: ExecutionContext) => T);

export function getRoom<T>(
  path: RealtimePath<T> = ResourcePath.default(),
  entity: EntityTarget<T>,
  context: ExecutionContext,
): ResourcePath {
  if (typeof path === "string") {
    return ResourcePath.get(path);
  }

  return typeof path === "function" ? path(entity.entity, context) : path;
}

export function getPath<T>(
  path: string | PathResolver<T> = "/",
  entity: EntityTarget<T>,
  context: ExecutionContext,
): string {
  return typeof path === "function" ? path(entity.entity, context) : path;
}
