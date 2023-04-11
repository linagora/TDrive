import { PREFIX_METADATA } from "../api";

export function WebService(prefix: string = "/"): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (target: Function): void {
    Reflect.defineMetadata(PREFIX_METADATA, prefix, target.prototype);
  };
}
