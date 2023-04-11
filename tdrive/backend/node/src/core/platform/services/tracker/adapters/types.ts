type Identity =
  | { userId: string | number }
  | { userId?: string | number | undefined; anonymousId: string | number };

export interface Analytics {
  /* The identify method lets you tie a user to their actions and record
       traits about them. */
  identify(
    message: Identity & {
      traits?: any;
      timestamp?: Date | undefined;
      context?: any;
    },
    callback?: (err: Error) => void,
  ): void;

  remove(identity: Identity, callback?: (err: Error) => void): void;

  /* The track method lets you record the actions your users perform. */
  track(
    message: Identity & {
      event: string;
      properties?: any;
      timestamp?: Date | undefined;
      context?: any;
    },
    callback?: (err: Error) => void,
  ): void;
}
