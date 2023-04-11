import { SERVICENAME_METADATA } from "../api";

export function ServiceName(name: string): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (target: Function): void {
    if (name) {
      Reflect.defineMetadata(SERVICENAME_METADATA, name, target.prototype);
    }
  };
}
