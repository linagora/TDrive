import { TdriveServiceProvider } from "./service-provider";

export interface TdriveServiceInterface<T extends TdriveServiceProvider> {
  doInit(): Promise<this>;
  doStart(): Promise<this>;
  doStop(): Promise<this>;
  api(): T;
}
