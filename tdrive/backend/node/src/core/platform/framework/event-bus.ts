import { Subject } from "rxjs";
import { logger as rootLogger } from "./logger";
import { ExecutionContext } from "./api/crud-service";

const logger = rootLogger.child({
  component: "tdrive.core.platform.framework.event-bus",
});

/**
 * A local event bus in the platform. Used by platform components and services to communicate using publish subscribe.
 */
class EventBus {
  private subjects: Map<string, Subject<any>>;
  constructor() {
    this.subjects = new Map<string, Subject<any>>();
  }

  subscribe<T>(name: string, listener: (_data: T) => void): this {
    if (!this.subjects.has(name)) {
      this.subjects.set(name, new Subject<T>());
    }

    this.subjects.get(name).subscribe({
      next: (value: T) => {
        try {
          listener(value);
        } catch (err) {
          logger.warn({ err }, "Error while calling listener");
        }
      },
    });

    return this;
  }

  publish<T>(name: string, data: T, _context?: ExecutionContext): boolean {
    if (!this.subjects.has(name)) {
      return false;
    }

    this.subjects.get(name)?.next(data);

    return true;
  }
}

export const localEventBus = new EventBus();
