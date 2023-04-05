import Repository from "../../../core/platform/services/database/services/orm/repository/repository";

import { OnlineGetRequest, OnlineGetResponse, OnlineServiceAPI } from "../api";
import { OnlinePubsubService } from "../pubsub";
import { DISCONNECTED_DELAY } from "../constants";
import UserOnline, {
  getInstance,
  TYPE as ONLINE_TYPE,
  UserOnlinePrimaryKey,
} from "../entities/user-online";
import gr from "../../global-resolver";
import { getLogger, TdriveLogger, TdriveServiceProvider } from "../../../core/platform/framework";
import { getUserRoom } from "../../../services/user/realtime";
import User from "../../../services/user/entities/user";
import { WebsocketUserEvent } from "../../../core/platform/services/websocket/types";
import { ExecutionContext } from "../../../core/platform/framework/api/crud-service";

export default class OnlineServiceImpl implements TdriveServiceProvider {
  version = "1";
  service: OnlineServiceAPI;
  private pubsubService: OnlinePubsubService;
  onlineRepository: Repository<UserOnline>;
  private logger: TdriveLogger;

  constructor() {
    this.logger = getLogger("online.service");
  }

  public async init(): Promise<this> {
    this.onlineRepository = await gr.database.getRepository(ONLINE_TYPE, UserOnline);

    this.pubsubService = new OnlinePubsubService();

    await this.pubsubService.init();

    gr.platformServices.websocket.onUserConnected(async event => {
      const user: User = await gr.services.users.get({
        id: event.user.id,
      });

      const companies = user?.cache?.companies;

      this.logger.info("User connected", event.user.id);
      // save the last connection date
      this.setLastSeenOnline([event.user.id], Date.now(), true);
      // broadcast to global pubsub so that everyone can publish to websockets
      this.broadcastOnline(event, companies);

      event.socket.on(
        "online:get",
        async (request: OnlineGetRequest, ack: (response: OnlineGetResponse) => void) => {
          this.logger.debug(`Got an online:get request for ${(request.data || []).length} users`);
          ack({ data: await this.getOnlineStatuses(request.data) });
        },
      );

      event.socket.on(
        "online:set",
        async (request: OnlineGetRequest, ack: () => void): Promise<void> => {
          this.logger.debug(`Got an online:set request for ${(request.data || []).length} users`);

          this.broadcastOnline(event, companies);
          this.setLastSeenOnline([event.user.id], Date.now(), true);
          ack();
        },
      );
    });

    gr.platformServices.websocket.onUserDisconnected(async event => {
      this.logger.info("User disconnected", event.user.id);
      // Since the user can be connected on several nodes, we cannot directly set it status to offline
      const room = getUserRoom(event.user.id);
      const userSockets = await event.socket.in(room).allSockets();

      if (userSockets.size === 0) {
        this.pubsubService.broadcastOnline([
          {
            company_id: "toBeFetched",
            user_id: event.user.id,
            is_online: false,
          },
        ]);
        this.setLastSeenOnline([event.user.id], Date.now(), false);
      }
    });

    return this;
  }

  private async getOnlineStatuses(ids: Array<string>): Promise<Array<[string, boolean]>> {
    console.log("socket getOnlineStatuses", ids);
    return this.areOnline(ids);
  }

  async setLastSeenOnline(
    userIds: Array<string> = [],
    date: number,
    is_connected: boolean,
  ): Promise<void> {
    this.logger.debug(`setLastSeenOnline ${userIds.join(",")}`);
    if (!userIds.length) {
      return;
    }
    const last_seen = date || Date.now();
    const uniqueIds = new Set<string>(userIds);
    this.logger.info(`Update last active state for users ${userIds.join(",")}`);
    const onlineUsers: UserOnline[] = Array.from(uniqueIds.values()).map(user_id =>
      getInstance({ user_id, last_seen, is_connected }),
    );
    await this.onlineRepository.saveAll(onlineUsers);

    //Send websocket event
    onlineUsers.forEach(u => {
      gr.services.users.publishPublicUserRealtime(u.user_id);
    });
  }

  async isOnline(userId: string, context?: ExecutionContext): Promise<boolean> {
    const user = await this.onlineRepository.findOne({ user_id: userId }, {}, context);

    if (!user) {
      return false;
    }

    return Date.now() - user.last_seen < DISCONNECTED_DELAY;
  }

  private async areOnline(
    ids: Array<string> = [],
    context?: ExecutionContext,
  ): Promise<Array<[string, boolean]>> {
    const users = [];
    //This foreach is needed for $in operators https://github.com/linagora/Tdrive/issues/1246
    for (let i = 0; i < ids.length; i += 100) {
      users.push(
        ...(
          await this.onlineRepository.find(
            {},
            { $in: [["user_id", ids.slice(i, i + 100)]] },
            context,
          )
        ).getEntities(),
      );
    }

    return users.map(user => [
      user.user_id,
      this.isStillConnected(user.last_seen, user.is_connected),
    ]);
  }

  /**
   * let's say that a user is connected when its last connection is more than some delay ago
   */
  private isStillConnected(date: number, is_connected: boolean): boolean {
    return Date.now() - date < DISCONNECTED_DELAY && is_connected;
  }

  private broadcastOnline(event: WebsocketUserEvent, companies: Array<string>): void {
    (companies || []).forEach(company => {
      this.pubsubService.broadcastOnline([
        {
          company_id: company,
          user_id: event.user.id,
          is_online: true,
        },
      ]);
    });
  }

  async get(pk: UserOnlinePrimaryKey): Promise<UserOnline> {
    return await this.onlineRepository.findOne(pk);
  }
}
