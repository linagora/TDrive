import { getLogger } from "../logger";

const logger = getLogger("core.platform.framework.decorators.Skip");

type SkipCondition = () => Promise<boolean> | boolean;

/**
 * Skip a method call based on some condition
 */
export function Skip(condition: SkipCondition): MethodDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (target: Object, _propertyKey: string, descriptor: PropertyDescriptor): void {
    logger.trace("Skipping method call");

    const originalMethod = descriptor.value;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    descriptor.value = async function (...args: any[]) {
      const skipIt = await (condition && condition());

      if (skipIt) {
        return target;
      }

      return await originalMethod.apply(this, args);
    };
  };
}

/**
 * Skip when process.env.NODE_ENV is set to "cli"
 */
export function SkipCLI(): MethodDecorator {
  return Skip(() => process.env.NODE_ENV === "cli");
}
