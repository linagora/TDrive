import { BehaviorSubject } from "rxjs";
import { TdriveServiceInterface } from "./service-interface";
import { TdriveServiceProvider } from "./service-provider";
import { TdriveServiceState } from "./service-state";
import { TdriveServiceConfiguration } from "./service-configuration";
import { TdriveContext } from "./context";
import { TdriveServiceOptions } from "./service-options";
import { CONSUMES_METADATA, PREFIX_METADATA } from "./constants";
import { getLogger, logger } from "../logger";
import { TdriveLogger } from "..";

const pendingServices: any = {};

export abstract class TdriveService<T extends TdriveServiceProvider>
  implements TdriveServiceInterface<TdriveServiceProvider>
{
  state: BehaviorSubject<TdriveServiceState>;
  readonly name: string;
  protected readonly configuration: TdriveServiceConfiguration;
  context: TdriveContext;
  logger: TdriveLogger;

  constructor(protected options?: TdriveServiceOptions<TdriveServiceConfiguration>) {
    this.state = new BehaviorSubject<TdriveServiceState>(TdriveServiceState.Ready);
    // REMOVE ME, we should import config from framework folder instead
    this.configuration = options?.configuration;
    this.logger = getLogger(`core.platform.services.${this.name}Service`);
  }

  abstract api(): T;

  public get prefix(): string {
    return Reflect.getMetadata(PREFIX_METADATA, this) || "/";
  }

  getConsumes(): Array<string> {
    return Reflect.getMetadata(CONSUMES_METADATA, this) || [];
  }

  async init(): Promise<this> {
    if (this.state.value !== TdriveServiceState.Ready) {
      logger.info("Service %s is already initialized", this.name);
      return this;
    }

    try {
      logger.info("Initializing service %s", this.name);
      pendingServices[this.name] = true;
      this.state.next(TdriveServiceState.Initializing);
      await this.doInit();
      this.state.next(TdriveServiceState.Initialized);
      logger.info("Service %s is initialized", this.name);
      delete pendingServices[this.name];
      logger.info("Pending services: %s", JSON.stringify(Object.keys(pendingServices)));
      return this;
    } catch (err) {
      logger.error("Error while initializing service %s", this.name);
      logger.error(err);
      this.state.error(new Error(`Error while initializing service ${this.name}`));

      throw err;
    }
  }

  async doInit(): Promise<this> {
    return this;
  }

  async doStart(): Promise<this> {
    return this;
  }

  async start(): Promise<this> {
    if (
      this.state.value === TdriveServiceState.Starting ||
      this.state.value === TdriveServiceState.Started
    ) {
      logger.info("Service %s is already started", this.name);
      return this;
    }

    try {
      logger.info("Starting service %s", this.name);
      this.state.next(TdriveServiceState.Starting);
      await this.doStart();
      this.state.next(TdriveServiceState.Started);
      logger.info("Service %s is started", this.name);

      return this;
    } catch (err) {
      logger.error("Error while starting service %s", this.name, err);
      logger.error(err);
      this.state.error(new Error(`Error while starting service ${this.name}`));

      throw err;
    }
  }

  async stop(): Promise<this> {
    if (
      this.state.value === TdriveServiceState.Stopping ||
      this.state.value === TdriveServiceState.Stopped
    ) {
      logger.info("Service %s is already stopped", this.name);
      return this;
    }

    if (this.state.value !== TdriveServiceState.Started) {
      logger.info("Service %s can not be stopped until started", this.name);
      return this;
    }

    try {
      logger.info("Stopping service %s", this.name);
      this.state.next(TdriveServiceState.Stopping);
      await this.doStop();
      this.state.next(TdriveServiceState.Stopped);
      logger.info("Service %s is stopped", this.name);

      return this;
    } catch (err) {
      logger.error("Error while stopping service %s", this.name, err);
      logger.error(err);
      this.state.error(new Error(`Error while stopping service ${this.name}`));

      throw err;
    }
  }

  async doStop(): Promise<this> {
    return this;
  }
}
