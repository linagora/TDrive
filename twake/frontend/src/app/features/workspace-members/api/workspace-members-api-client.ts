import Api from '../../global/framework/api-service';
import {
  WorkspacePendingUserType,
  WorkspaceUserType,
} from 'app/features/workspaces/types/workspace';
import { TdriveService } from '../../global/framework/registry-decorator-service';

const PREFIX = '/internal/services/workspaces/v1/companies';

@TdriveService('WorkspaceUserAPIClientService')
class WorkspaceUserAPIClientService {
  /**
   * Get all workspace users
   *
   * @param companyId
   * @param workspaceId
   * @returns Promise<WorkspaceUserType[]
   */
  async list(companyId: string, workspaceId: string): Promise<WorkspaceUserType[]> {
    const workspaceUsersRoute = `${PREFIX}/${companyId}/workspaces/${workspaceId}/users`;
    return Api.get<{ resources: WorkspaceUserType[] }>(workspaceUsersRoute).then(result =>
      result.resources && result.resources.length ? result.resources : [],
    );
  }

  /**
   * Get a workspace user
   *
   * @param companyId
   * @param workspaceId
   * @returns Promise<WorkspaceUserType>
   */
  async get(companyId: string, workspaceId: string, userId: string): Promise<WorkspaceUserType> {
    return Api.get<{ resource: WorkspaceUserType }>(
      `${PREFIX}/${companyId}/workspaces/${workspaceId}/users/${userId}`,
    ).then(result => result.resource);
  }

  async listPending(companyId: string, workspaceId: string): Promise<WorkspacePendingUserType[]> {
    return Api.get<{ resources: WorkspacePendingUserType[] }>(
      `${PREFIX}/${companyId}/workspaces/${workspaceId}/pending`,
    ).then(result => result.resources);
  }

  async cancelPending(companyId: string, workspaceId: string, email: string): Promise<void> {
    const removePendingEmailRoute = `${PREFIX}/${companyId}/workspaces/${workspaceId}/pending/${email}`;
    await Api.delete(removePendingEmailRoute);
  }
}
const WorkspaceUserAPIClient = new WorkspaceUserAPIClientService();
export default WorkspaceUserAPIClient;
