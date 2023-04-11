import { TdriveServiceProvider } from "../../core/platform/framework";
import UserOnline, { UserOnlinePrimaryKey } from "./entities/user-online";

export type OnlineEvent = {
  company_id: string;
  user_id: string;
  is_online: boolean;
};

export type UsersOnlineMessage = Array<OnlineEvent>;

export type OnlineGetRequest = {
  /* Array of ids to get status */
  data: Array<string>;
};

export type OnlineGetResponse = {
  data: Array<[string, boolean]>;
};

export interface OnlineServiceAPI extends TdriveServiceProvider {
  isOnline(userId: string): Promise<boolean>;
  setLastSeenOnline(userIds: Array<string>, lastSeen: number, is_connected: boolean): Promise<void>;
  get(userId: UserOnlinePrimaryKey): Promise<UserOnline>;
}
