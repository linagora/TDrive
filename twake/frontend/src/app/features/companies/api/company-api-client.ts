import { CompanyType } from 'app/features/companies/types/company';
import { WorkspaceType } from 'app/features/workspaces/types/workspace';
import Api from '../../global/framework/api-service';
import { TdriveService } from '../../global/framework/registry-decorator-service';
import { WebsocketRoom } from '../../global/types/websocket-types';

const PREFIX = '/internal/services/users/v1';

export type WorkspaceUpdateResource = Pick<WorkspaceType, 'name' | 'logo' | 'default' | 'archived'>;

export type UpdateWorkspaceBody = {
  resource: WorkspaceUpdateResource;
};

@TdriveService('CompanyAPIClientService')
class CompanyAPIClient {
  private realtime: Map<string, WebsocketRoom> = new Map();

  websocket(companyId: string): WebsocketRoom {
    return this.realtime.get(companyId) || { room: '', token: '' };
  }

  /**
   * Get a list of companies for a user, only common companies with current user are returned.
   
   * @param companyId
   */
  async listCompanies(userId: string): Promise<CompanyType[]> {
    return Api.get<{ resources: CompanyType[] }>(`${PREFIX}/users/${userId}/companies`).then(
      result => (result.resources && result.resources.length ? result.resources : []),
    );
  }

  /**
   * Get a company by id and public information (this route is public and doesn't need to be authenticated)
   *
   * @param companyId
   */
  async get(companyId: string, disableJWTAuthentication = false): Promise<CompanyType> {
    return Api.get<{ resource: CompanyType; websocket: WebsocketRoom }>(
      `${PREFIX}/companies/${companyId}`,
      undefined,
      false,
      { disableJWTAuthentication },
    ).then(result => {
      result.resource?.id && this.realtime.set(result.resource.id, result.websocket);
      return result.resource;
    });
  }
}

export default new CompanyAPIClient();
