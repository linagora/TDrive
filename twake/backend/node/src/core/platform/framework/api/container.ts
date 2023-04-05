import { TdriveAppConfiguration } from "./application-configuration";
import { TdriveComponent } from "./component";
import { TdriveContext } from "./context";
import { TdriveServiceProvider } from "./service-provider";
import { TdriveService } from "./service";
import { TdriveServiceState } from "./service-state";
import * as ComponentUtils from "../utils/component-utils";

/**
 * A container contains components. It provides methods to manage and to retrieve them.
 */
export abstract class TdriveContainer
  extends TdriveService<TdriveServiceProvider>
  implements TdriveContext
{
  private components: Map<string, TdriveComponent>;
  name = "TdriveContainer";

  constructor(protected options?: TdriveAppConfiguration) {
    super(options);
  }

  abstract loadComponents(): Promise<Map<string, TdriveComponent>>;

  abstract loadComponent(name: string): Promise<TdriveComponent>;

  getProvider<T extends TdriveServiceProvider>(name: string): T {
    const service = this.components.get(name)?.getServiceInstance();

    if (!service) {
      throw new Error(`Service "${name}" not found`);
    }

    return service.api() as T;
  }

  async doInit(): Promise<this> {
    this.components = await this.loadComponents();
    await ComponentUtils.buildDependenciesTree(this.components, async (name: string) => {
      const component = await this.loadComponent(name);
      if (component) this.components.set(name, component);
      return component;
    });

    await this.launchInit();

    return this;
  }

  protected async launchInit(): Promise<this> {
    await this.switchToState(TdriveServiceState.Initialized);

    return this;
  }

  async doStart(): Promise<this> {
    await this.switchToState(TdriveServiceState.Started);

    return this;
  }

  async doStop(): Promise<this> {
    await this.switchToState(TdriveServiceState.Stopped);

    return this;
  }

  protected async switchToState(
    state: TdriveServiceState.Started | TdriveServiceState.Initialized | TdriveServiceState.Stopped,
  ): Promise<void> {
    await ComponentUtils.switchComponentsToState(this.components, state);
  }
}
