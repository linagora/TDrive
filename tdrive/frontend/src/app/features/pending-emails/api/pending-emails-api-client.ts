import {
  AtomPendingEmailsKey,
  DeletePendingEmailResponse,
  PendingEmail,
  SavePendingEmailRequest,
} from '../types/pending-email';
import Api from 'app/features/global/framework/api-service';
import { TdriveService } from 'app/features/global/framework/registry-decorator-service';

@TdriveService('PendingEmailsAPIClientService')
class PendingEmailsAPIClientService {
  private readonly prefix = '/internal/services/channels/v1/companies';

  async save(email: string, context: AtomPendingEmailsKey) {
    const { companyId, workspaceId, channelId } = context;
    return Api.post<SavePendingEmailRequest, { resource: PendingEmail }>(
      `${this.prefix}/${companyId}/workspaces/${workspaceId}/channels/${channelId}/pending_emails`,
      {
        resource: {
          company_id: companyId,
          workspace_id: workspaceId,
          channel_id: channelId,
          email,
        },
      },
    ).then(r => r.resource);
  }

  async get(email: string, context: AtomPendingEmailsKey) {
    const { companyId, workspaceId, channelId } = context;
    return Api.get<PendingEmail>(
      `${this.prefix}/${companyId}/workspaces/${workspaceId}/channels/${channelId}/pending_emails/${email}`,
    );
  }

  async list({ companyId, workspaceId, channelId }: AtomPendingEmailsKey) {
    return Api.get<{ resources: PendingEmail[] }>(
      `${this.prefix}/${companyId}/workspaces/${workspaceId}/channels/${channelId}/pending_emails`,
    ).then(r => r.resources);
  }

  async delete(email: string, context: AtomPendingEmailsKey) {
    const { companyId, workspaceId, channelId } = context;
    return Api.delete<DeletePendingEmailResponse>(
      `${this.prefix}/${companyId}/workspaces/${workspaceId}/channels/${channelId}/pending_emails/${email}`,
    );
  }
}

const PendingEmailsAPIClient = new PendingEmailsAPIClientService();
export default PendingEmailsAPIClient;
