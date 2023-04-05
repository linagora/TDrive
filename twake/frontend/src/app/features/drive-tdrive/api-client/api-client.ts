import Api from '../../global/framework/api-service';
import { DriveTdriveTab } from '../types';

export class DriveTdriveApiClient {
  static async getTab(companyId: string, tabId: string) {
    return await Api.get<DriveTdriveTab>(
      `/internal/services/documents/v1/companies/${companyId}/tabs/${tabId}`,
    );
  }

  static async setTab(
    companyId: string,
    tabId: string,
    channelId: string,
    itemId: string,
    level: 'write' | 'read',
  ) {
    return await Api.post<DriveTdriveTab, DriveTdriveTab>(
      `/internal/services/documents/v1/companies/${companyId}/tabs/${tabId}`,
      {
        company_id: companyId,
        tab_id: tabId,
        channel_id: channelId,
        item_id: itemId,
        level,
      },
    );
  }
}
