import { BehaviorSubject } from "rxjs";
import { TdriveService } from "./service";
import { TdriveServiceProvider } from "./service-provider";
import { ServiceDefinition } from "./service-definition";
import { TdriveServiceState } from "./service-state";
import { logger } from "../logger";

export class TdriveComponent {
  instance: TdriveService<TdriveServiceProvider>;
  components: Array<TdriveComponent> = new Array<TdriveComponent>();

  constructor(public name: string, private serviceDefinition: ServiceDefinition) {}

  getServiceDefinition(): ServiceDefinition {
    return this.serviceDefinition;
  }

  setServiceInstance(instance: TdriveService<TdriveServiceProvider>): void {
    this.instance = instance;
  }

  getServiceInstance(): TdriveService<TdriveServiceProvider> {
    return this.instance;
  }

  addDependency(component: TdriveComponent): void {
    this.components.push(component);
  }

  getStateTree(): string {
    return `${this.name}(${this.instance.state.value}) => {${this.components
      .map(component => component.getStateTree())
      .join(",")}}`;
  }

  async switchToState(
    state: TdriveServiceState.Initialized | TdriveServiceState.Started | TdriveServiceState.Stopped,
    recursionDepth?: number,
  ): Promise<void> {
    if (recursionDepth > 10) {
      logger.error("Maximum recursion depth exceeded (will exit process)");
      process.exit(1);
    }

    const states: BehaviorSubject<TdriveServiceState>[] = this.components.map(
      component => component.instance.state,
    );

    if (states.length) {
      for (const component of this.components) {
        await component.switchToState(state, (recursionDepth || 0) + 1);
      }
      logger.info(`Children of ${this.name} are all in ${state} state`);
      logger.info(this.getStateTree());
    } else {
      logger.info(`${this.name} does not have children`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function _switchServiceToState(service: TdriveService<any>) {
      state === TdriveServiceState.Initialized && (await service.init());
      state === TdriveServiceState.Started && (await service.start());
      state === TdriveServiceState.Stopped && (await service.stop());
    }
    await _switchServiceToState(this.instance);
  }
}
