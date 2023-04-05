import { TdriveContainer, TdriveServiceProvider, TdriveComponent } from "./framework";
import * as ComponentUtils from "./framework/utils/component-utils";
import path from "path";

export class TdrivePlatform extends TdriveContainer {
  constructor(protected options: TdrivePlatformConfiguration) {
    super();
  }

  api(): TdriveServiceProvider {
    return null;
  }

  async loadComponents(): Promise<Map<string, TdriveComponent>> {
    return await ComponentUtils.loadComponents(
      [this.options.servicesPath, path.resolve(__dirname, "./services/")],
      this.options.services,
      {
        getProvider: this.getProvider.bind(this),
      },
    );
  }

  async loadComponent(name: string): Promise<TdriveComponent> {
    return (
      await ComponentUtils.loadComponents(
        [this.options.servicesPath, path.resolve(__dirname, "./services/")],
        [name],
        {
          getProvider: this.getProvider.bind(this),
        },
      )
    ).get(name);
  }
}

export class TdrivePlatformConfiguration {
  /**
   * The services to load in the container
   */
  services: string[];

  /**
   * The path to load services from
   */
  servicesPath: string;
}
