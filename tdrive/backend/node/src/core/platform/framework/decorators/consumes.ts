import { CONSUMES_METADATA } from "../api";

export function Consumes(services: string[] = []): ClassDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (target: Function): void {
    Reflect.defineMetadata(CONSUMES_METADATA, services, target.prototype);
  };
}
