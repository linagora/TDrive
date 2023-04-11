import { logger } from "../../framework";
import { MessageQueueHandler, MessageQueueServiceAPI, MessageQueueServiceProcessor } from "./api";

const LOG_PREFIX = "service.message-queue.Processor";

export class Processor {
  // TODO: Add state
  private registry: ProcessorRegistry;
  private started = false;

  constructor(private messageQueue: MessageQueueServiceAPI) {
    this.registry = new ProcessorRegistry(this.messageQueue);
  }

  async init(): Promise<this> {
    return this;
  }

  async start(): Promise<void> {
    this.started = true;
    await Promise.all(
      Array.from(this.registry.processors.keys()).map(async name => {
        logger.info(`${LOG_PREFIX} - Starting notification processor ${name}`);
        await this.registry.processors.get(name)?.init();
        logger.info(`${LOG_PREFIX} - notification processor ${name} is started`);
      }),
    );
  }

  async stop(): Promise<void> {
    this.started = false;
    await Promise.all(
      Array.from(this.registry.processors.keys()).map(async name => {
        this.removeHandler(name);
      }),
    );
  }

  addHandler<In, Out>(handler: MessageQueueHandler<In, Out>): void {
    if (!handler) {
      throw new Error(`${LOG_PREFIX} - Can not add null handler`);
    }

    logger.info(`${LOG_PREFIX} - Adding message-queue handler ${handler.name}`);
    this.registry.register(handler);

    if (this.started) {
      this.startHandler(handler.name);
    }
  }

  async startHandler(name: string): Promise<void> {
    logger.info(`${LOG_PREFIX} - Starting message-queue handler ${name}`);
    await this.registry.processors.get(name)?.init();
  }

  stopHandler(name: string): void {
    logger.info(`${LOG_PREFIX} - Stopping message-queue handler ${name}`);
    this.registry.processors.get(name)?.stop();
  }

  removeHandler(name: string): void {
    logger.info(`${LOG_PREFIX} - Removing message-queue handler ${name}`);
    this.stopHandler(name);
    this.registry.processors.delete(name);
  }
}

class ProcessorRegistry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  processors: Map<string, MessageQueueServiceProcessor<any, any>>;

  constructor(private messageQueue: MessageQueueServiceAPI) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.processors = new Map<string, MessageQueueServiceProcessor<any, any>>();
  }

  register<In, Out>(handler: MessageQueueHandler<In, Out>): void {
    if (!handler) {
      throw new Error("Can not add a null handler");
    }
    this.processors.set(
      handler.name,
      new MessageQueueServiceProcessor<In, Out>(handler, this.messageQueue),
    );
  }
}
