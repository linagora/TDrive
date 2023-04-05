import { TdriveServiceProvider } from "./service-provider";

export interface TdriveContext {
  getProvider<T extends TdriveServiceProvider>(name: string): T;
}
