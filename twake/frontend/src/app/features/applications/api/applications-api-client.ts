import Api from '../../global/framework/api-service';
import { TdriveService } from '../../global/framework/registry-decorator-service';
import { Application } from 'app/features/applications/types/application';

type DeleteApplicationResponse = {
  status: 'success' | 'error';
};

@TdriveService('ApplicationsAPIClientService')
class ApplicationsAPIClientService {
  prefix = '/internal/services/applications/v1/applications';
  /**
   * Search all applications
   */
  async search(search?: string): Promise<Application[]> {
    return Api.get<{ resources: Application[] }>(
      `${this.prefix}${search ? `?search=${search}` : ''}`,
    ).then(result => (result.resources && result.resources.length ? result.resources : []));
  }

  /**
   * Get an application
   *
   * @param applicationId
   * @returns
   */
  async get(applicationId: string): Promise<Application> {
    return Api.get<{ resource: Application }>(`${this.prefix}/${applicationId}`).then(
      result => result.resource,
    );
  }

  async save(
    applicationId: string,
    partialsToUpdate: Partial<Application>,
    callback?: (result: Application) => void,
  ): Promise<Application> {
    return Api.post<{ resource: Partial<Application> }, Application>(
      `${this.prefix}/${applicationId}`,
      { resource: partialsToUpdate },
      callback,
    );
  }

  delete(applicationId: string): Promise<DeleteApplicationResponse> {
    return Api.delete<DeleteApplicationResponse>(`${this.prefix}/${applicationId}`);
  }

  async createCustomApplication(application: Partial<Application>): Promise<Application> {
    return Api.post<{ resource: Partial<Application> }, { resource: Application }>(this.prefix, {
      resource: application,
    }).then(result => result.resource);
  }
}
const ApplicationsAPIClient = new ApplicationsAPIClientService();
export default ApplicationsAPIClient;
