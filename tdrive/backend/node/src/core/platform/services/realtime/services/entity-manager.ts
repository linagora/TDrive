import { logger } from "../../../framework/logger";
import { RealtimeEntityActionType, RealtimeEntityEvent } from "../types";
import WebSocketAPI from "../../../services/websocket/provider";
import { websocketEventBus } from "../bus";

const REALTIME_RESOURCE = "realtime:resource";

export default class RealtimeEntityManager {
  constructor(private ws: WebSocketAPI) {}

  init(): void {
    websocketEventBus.subscribe(RealtimeEntityActionType.Created, event => {
      this.pushResourceEvent(event, RealtimeEntityActionType.Created);
    });

    websocketEventBus.subscribe(RealtimeEntityActionType.Updated, event => {
      this.pushResourceEvent(event, RealtimeEntityActionType.Updated);
    });

    websocketEventBus.subscribe(RealtimeEntityActionType.Deleted, event => {
      this.pushResourceEvent(event, RealtimeEntityActionType.Deleted);
    });

    websocketEventBus.subscribe(RealtimeEntityActionType.Saved, event => {
      this.pushResourceEvent(event, RealtimeEntityActionType.Saved);
    });

    websocketEventBus.subscribe(RealtimeEntityActionType.Event, event => {
      this.pushResourceEvent(event, RealtimeEntityActionType.Event);
    });
  }

  private pushResourceEvent(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event: RealtimeEntityEvent<any>,
    action: RealtimeEntityActionType,
  ): void {
    event.room.path.forEach(path => {
      logger.info(`Pushing ${action} entity to room ${path}`);
      const message: unknown = {
        action,
        room: path,
        type: event.type,
        path: event.resourcePath,
        resource: event.entity,
      };
      if (logger.isLevelEnabled("debug")) {
        logger.debug(`Entity to push to room ${path}: %o`, message);
      }

      this.ws.getIo().to(path).emit(REALTIME_RESOURCE, message);
    });
  }
}
