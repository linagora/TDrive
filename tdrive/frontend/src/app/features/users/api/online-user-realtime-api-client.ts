import WebSocketService from '../../global/services/websocket-service';
import Logger from '../../global/framework/logger-service';
import UsersService from 'app/features/users/services/current-user-service';
const logger = Logger.getLogger('OnlineUsersRealtimeAPI');

export type GetUserRequestType = string;
export type GetUsersRequestType = Array<GetUserRequestType>;
export type GetUserResponseType = [string, boolean];
export type GetUsersResponseType = Array<GetUserResponseType>;
export type RealtimeUpdateMessageType = GetUsersResponseType;

export type OnlineUserRealtimeAPIType = {
  getUserStatus: (id: GetUserRequestType) => Promise<GetUserResponseType>;
  getUsersStatus: (ids: GetUsersRequestType) => Promise<GetUsersResponseType>;
  setMyStatus: () => void;
};

export const ONLINE_ROOM = (companyId: string) => `/users/online/${companyId}`;

export const OnlineUserRealtimeAPI = (websocket: WebSocketService): OnlineUserRealtimeAPIType => {
  const getUserStatus = (id: GetUserRequestType): Promise<GetUserResponseType> => {
    logger.debug(`Get user online status ${id}`);
    return getUsersStatus([id]).then(response => response?.[0] || [id, false]);
  };

  const getUsersStatus = (ids: GetUsersRequestType = []): Promise<GetUsersResponseType> => {
    logger.debug(`Get users statuses ${ids.join(',')}`);
    return websocket
      .get<GetUsersRequestType, GetUsersResponseType>('online:get', ids)
      .then(result => result || []);
  };

  const setMyStatus = (): void => {
    const id = UsersService.getCurrentUserId();
    logger.debug(`Set user online status ${id}`);

    websocket
      .get<GetUsersRequestType, GetUsersResponseType>('online:set', [id])
      .then(result => result || []);
  };

  return {
    getUserStatus,
    getUsersStatus,
    setMyStatus,
  };
};
