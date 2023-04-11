import { Consumes, ServiceName, TdriveService } from "../../framework";
import { SkipCLI } from "../../framework/decorators/skip";
import { localEventBus } from "../../framework/event-bus";
import WebSocketAPI from "../../services/websocket/provider";
import AuthService from "../auth/provider";
import { RealtimeEventBus, RealtimeRoomManager, RealtimeServiceAPI } from "./api";
import { websocketEventBus } from "./bus";
import RealtimeEntityManager from "./services/entity-manager";
import RoomManagerImpl from "./services/room-manager";
import { RealtimeBaseBusEvent, RealtimeLocalBusEvent } from "./types";

@Consumes(["websocket", "auth"])
@ServiceName("realtime")
export default class RealtimeService
  extends TdriveService<RealtimeServiceAPI>
  implements RealtimeServiceAPI
{
  private roomManager: RoomManagerImpl;
  private entityManager: RealtimeEntityManager;
  private auth: AuthService;
  version = "1";

  api(): RealtimeServiceAPI {
    return this;
  }

  @SkipCLI()
  async doStart(): Promise<this> {
    const ws = this.context.getProvider<WebSocketAPI>("websocket");
    this.auth = this.context.getProvider<AuthService>("auth");

    this.roomManager = new RoomManagerImpl(ws, this.auth);
    this.roomManager.init();
    this.entityManager = new RealtimeEntityManager(ws);
    this.entityManager.init();

    localEventBus.subscribe("realtime:event", (event: RealtimeBaseBusEvent<any>) => {
      event.data._type = event.type;
      ws.getIo().to(event.room).emit("realtime:event", { name: event.room, data: event.data });
    });

    localEventBus.subscribe("realtime:publish", (data: RealtimeLocalBusEvent<any>) => {
      this.getBus().publish(data.topic, data.event);
    });

    return this;
  }

  getBus(): RealtimeEventBus {
    return websocketEventBus;
  }

  getRoomManager(): RealtimeRoomManager {
    return this.roomManager;
  }

  getEntityManager(): RealtimeEntityManager {
    return this.entityManager;
  }

  sign(items: { room: string }[], sub: string) {
    return items.map(item => {
      const token = this.auth.sign({
        sub,
        name: item.room,
        //Fixme, reduce this number but also in frontend reload the websocket token after this ends
        iat: Math.round(new Date().getTime() / 1000) + 60 * 60 * 24 * 31,
        nbf: Math.round(new Date().getTime() / 1000) - 60,
      });
      return {
        ...item,
        token,
      };
    });
  }
}
