import { ExecutionContext } from "../../framework/api/crud-service";

export type IdentityType = { user: ExecutionContext["user"] };

export type IdentifyObjectType = IdentityType & {
  traits?: { [key: string]: unknown };
  timestamp?: Date;
  context?: { [key: string]: unknown };
};

export type TrackedEventType = IdentityType & {
  // event starts with prefix `tdrive:`
  event: string;
  properties?: { [key: string]: unknown };
  timestamp?: Date;
  context?: { [key: string]: unknown };
};

export type TrackerConfiguration = {
  key: string;
};
