import Api from '../../global/framework/api-service';
import { NotificationType } from 'app/features/users/types/notification-types';
import { TdriveService } from '../../global/framework/registry-decorator-service';
import { WebsocketRoom } from 'app/features/global/types/websocket-types';

@TdriveService('UserNotificationAPIClientService')
class UserNotificationAPIClient {
  private realtime: WebsocketRoom = { room: '', token: '' };

  websocket(): WebsocketRoom {
    return this.realtime;
  }

  async getAllCompaniesBadges(): Promise<NotificationType[]> {
    const response = await Api.get<{ resources: NotificationType[]; websockets: WebsocketRoom[] }>(
      '/internal/services/notifications/v1/badges?limit=1000&websockets=1&all_companies=true',
    );
    if (response.websockets) this.realtime = response.websockets[0];
    return response.resources ? response.resources : [];
  }

  async getCompanyBadges(companyId: string): Promise<NotificationType[]> {
    const response = await Api.get<{ resources: NotificationType[]; websockets: WebsocketRoom[] }>(
      '/internal/services/notifications/v1/badges?limit=1000&websockets=1&company_id=' + companyId,
    );
    if (response.websockets) this.realtime = response.websockets[0];
    return response.resources ? response.resources : [];
  }

  async acknowledge(notification: NotificationType): Promise<void> {
    const { message_id, channel_id, company_id, thread_id, workspace_id } = notification;
    await Api.post<{ message_id: string, thread_id: string, channel_id: string, workspace_id: string}, boolean>(
      `/internal/services/notifications/v1/badges/${company_id}/acknowledge`,
      {
        channel_id,
        workspace_id,
        thread_id,
        message_id,
      }
    );
  }
}

export default new UserNotificationAPIClient();
