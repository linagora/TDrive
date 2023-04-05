import { preferencesType, NotificationPreferencesType } from '../types/notifications-preferences';
import Api from 'app/features/global/framework/api-service';
import { TdriveService } from 'app/features/global/framework/registry-decorator-service';

@TdriveService('NotificationsPreferencesAPIClientService')
class NotificationsPreferencesAPIClientService {
  private readonly apiUrl = '/internal/services/notifications/v1/preferences';

  async save(resourcePreference: preferencesType) {
    return Api.post<{ resource: preferencesType }, { resource: NotificationPreferencesType }>(
      this.apiUrl,
      { resource: resourcePreference },
    ).then(r => r.resource);
  }

  async get() {
    return Api.get<{ resources: NotificationPreferencesType[] }>(this.apiUrl).then(
      r => r.resources[0],
    );
  }
}

const NotificationsPreferencesAPIClient = new NotificationsPreferencesAPIClientService();
export default NotificationsPreferencesAPIClient;
