import Api from 'app/features/global/framework/api-service';
import { TdriveService } from 'app/features/global/framework/registry-decorator-service';
import { InvitationType as InvitationRoleType, InvitedUser } from '../state/invitation';
import Logger from 'app/features/global/framework/logger-service';

type InvitationType = {
  email: string;
  role: string;
  company_role: InvitationRoleType;
};

type WorkspaceUserInvitationResponseType = {
  email: string;
  status: 'ok' | 'error';
  message?: string;
};

type WorkspaceUserInvitationPayloadType = {
  invitations: InvitationType[];
  channels: string[];
};

type WorkspaceInvitationTokenResponseType = {
  resource: {
    token: string;
  };
};

type WorkspaceInvitationTokenPayloadType = {
  channels: string[];
};

@TdriveService('InvitationApiClientService')
class InvitationApiClient {
  private readonly apiBaseUrl: string = '/internal/services/workspaces/v1/companies';
  logger: Logger.Logger;

  constructor() {
    this.logger = Logger.getLogger('Invitation');
  }

  /**
   * Creates an invitation token to the workspace
   *
   * @param {String} companyId    - the company
   * @param {String} workspaceId  - the workspace to be invited in.
   * @param {String[]} channels   - the channels to be invited in.
   * @returns {String}            - the invitation token.
   */
  async createInvitationToken(
    companyId: string,
    workspaceId: string,
    channels: string[],
  ): Promise<string> {
    return Api.post<WorkspaceInvitationTokenPayloadType, WorkspaceInvitationTokenResponseType>(
      `${this.apiBaseUrl}/${companyId}/workspaces/${workspaceId}/users/tokens`,
      { channels },
    ).then(({ resource }) => resource.token);
  }

  /**
   * Invite users to workspace by email
   *
   * @param {String} companyId - the company id.
   * @param {String} workspaceId - the workspace id.
   * @param {InvitedUser[]} invitedUsers - the array of emails to invite with their roles.
   */
  async inviteToWorkspace(companyId: string, workspaceId: string, invitedUsers: InvitedUser[], channels: string[]) {
    const response = await Api.post<
      WorkspaceUserInvitationPayloadType,
      { resources: WorkspaceUserInvitationResponseType[] }
    >(`${this.apiBaseUrl}/${companyId}/workspaces/${workspaceId}/users/invite`, {
      invitations: [
        ...invitedUsers.map(({ email, role }) => ({
          email,
          role: 'member',
          company_role: role,
        })),
      ],
      channels,
    });

    if (!response.resources || !response.resources.length) {
      this.logger.error('Failed to invite users to the workspace');
      throw Error('Failed to invite users to the workspace');
    }

    if (response.resources.filter(({ message }) => message && message.includes('403')).length) {
      this.logger.error('No access rights to invite to this company');
      throw Error('Failed to invite users: No access rights to invite to this company');
    }

    if (response.resources.filter(({ status }) => status === 'error').length === response.resources.length) {
      this.logger.error('Failed to invite users to the company');
      throw Error('Failed to invite users');
    }

    response.resources
      .filter(({ status }) => status === 'error')
      .forEach(({ email, message }) => {
        this.logger.error(`Failed to invite ${email}: ${message}`);
      });

    return response;
  }
}

export default new InvitationApiClient();
