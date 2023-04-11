import { CreateResult } from "../../api/crud-service";
import { RealtimeEntityEvent, RealtimeEntityActionType } from "../../../services/realtime/types";
import { websocketEventBus } from "../../../services/realtime/bus";
import { getRealtimeRecipients, getRoom, RealtimeRecipients } from ".";

/**
 *
 * @param path the path to push the notification to
 * @param resourcePath the path of the resource itself
 */
export function RealtimeCreated<T>(recipients: RealtimeRecipients<T>): MethodDecorator {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (target: Object, propertyKey: string, descriptor: PropertyDescriptor): void {
    const originalMethod = descriptor.value;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    descriptor.value = async function (...args: any[]) {
      const result: CreateResult<T> = await originalMethod.apply(this, args);
      // context should always be the last arg
      const context = args && args[args.length - 1];

      if (!(result instanceof CreateResult)) {
        return result;
      }

      getRealtimeRecipients(recipients, result.entity, context).forEach(
        ({ room, path, resource }) => {
          websocketEventBus.publish<T>(RealtimeEntityActionType.Created, {
            type: result.type,
            room: getRoom(room, result, context),
            resourcePath: path || "/",
            entity: resource,
            result,
          } as RealtimeEntityEvent<T>);
        },
      );

      return result;
    };
  };
}
