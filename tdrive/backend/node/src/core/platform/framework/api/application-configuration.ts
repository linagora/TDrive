import { TdriveServiceOptions } from "./service-options";
import { TdriveServiceConfiguration } from "./service-configuration";

export class TdriveAppConfiguration extends TdriveServiceOptions<TdriveServiceConfiguration> {
  services: Array<string>;
  servicesPath: string;
}
