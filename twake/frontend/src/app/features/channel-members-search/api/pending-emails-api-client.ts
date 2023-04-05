import Api from "app/features/global/framework/api-service";
import { TdriveService } from "app/features/global/framework/registry-decorator-service";
import { ChannelPendingEmail, ChannelPendingEmailResponse, ParamsChannelMember, PayloadChannelPendingEmail, ResponseChannelPendingEmail, ResponseDeletePendingEmailResponse } from "../types/channel-members";

@TdriveService('ChannelPendingEmailMemberAPIClientService')
class ChannelPendingEmailApiClient {
    private readonly apiBaseUrl: string = '/internal/services/channels/v1/companies';

    async list(params: ParamsChannelMember) {
        const { companyId, workspaceId, channelId } = params;

        return Api.get<ChannelPendingEmailResponse>(
            `${this.apiBaseUrl}/${companyId}/workspaces/${workspaceId}/channels/${channelId}/pending_emails`,
        ).then(({resources}) => resources);
    }

    async get(email: string, params: ParamsChannelMember) {
        const { companyId, workspaceId, channelId } = params;

        return Api.get<ChannelPendingEmail>(
            `${this.apiBaseUrl}/${companyId}/workspaces/${workspaceId}/channels/${channelId}/pending_emails/${email}`,
        );
    }

    async add(
        guest: Partial<ChannelPendingEmail>,
        params: ParamsChannelMember,
    ) {
        const { companyId, workspaceId, channelId } = params;

        return Api.post<PayloadChannelPendingEmail, ResponseChannelPendingEmail>(
            `${this.apiBaseUrl}/${companyId}/workspaces/${workspaceId}/channels/${channelId}/pending_emails`,
            { resource: guest }
        ).then(({resource}) => resource);
    }

    async delete(
        email: string,
        params: ParamsChannelMember,
    ) {
        const { companyId, workspaceId, channelId } = params;

        return Api.delete<ResponseDeletePendingEmailResponse>(
            `${this.apiBaseUrl}/${companyId}/workspaces/${workspaceId}/channels/${channelId}/pending_emails/${email}`,
        );
    }
}

export default new ChannelPendingEmailApiClient();
