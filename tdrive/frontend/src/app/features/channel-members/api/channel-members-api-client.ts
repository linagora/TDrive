import Api from '../../global/framework/api-service';
import { TdriveService } from '../../global/framework/registry-decorator-service';
import {
  ChannelMemberRole,
  ChannelMemberType,
} from 'app/features/channel-members/types/channel-member-types';
import { WebsocketRoom } from 'app/features/global/types/websocket-types';
import { ChannelMemberReadSectionType } from '../types/channel-member-read-section-type';

type ChannelMembersSaveRequest = { resource: Partial<ChannelMemberType> };
type ChannelMembersSaveResponse = { resource: ChannelMemberType };

@TdriveService('ChannelMembersAPIClientService')
class ChannelCurrentMemberAPIClientService {
  private readonly prefix = '/internal/services/channels/v1/companies';
  private realtime: Map<
    { companyId: string; workspaceId: string; channelId: string },
    WebsocketRoom[]
  > = new Map();

  websocket({
    companyId,
    workspaceId,
    channelId,
  }: {
    companyId: string;
    workspaceId: string;
    channelId: string;
  }): WebsocketRoom[] {
    return this.realtime.get({ companyId, workspaceId, channelId }) || [];
  }

  /**
   * Every member of the channel can list members of the channel.
   * This returns a list of members in a channel.
   *
   * @param companyId string
   * @param workspaceId string
   * @param channelId string
   * @returns ChannelMemberType[]
   */
  async list(
    context: { companyId: string; workspaceId: string; channelId: string },
    filters?: { role: ChannelMemberRole },
  ) {
    return Api.get<{ resources: ChannelMemberType[]; websockets: WebsocketRoom[] }>(
      `${this.prefix}/${context.companyId}/workspaces/${context.workspaceId}/channels/${
        context.channelId
      }/members${filters?.role ? `?company_role=${filters.role}` : ''}?websockets=1`,
    ).then(result => {
      result.websockets && this.realtime.set(context, result.websockets);
      return result.resources;
    });
  }

  /**
   * Channel member can update their own preferences
   *
   * @param channelMember ChannelMemberType
   * @param partialsToUpdate Partial ChannelMemberType
   * @param context Execution context of the update
   */
  async updateChannelMemberPreferences(
    channelMember: ChannelMemberType,
    partialsToUpdate: Partial<ChannelMemberType>,
    context: { companyId: string; workspaceId: string; channelId: string; userId: string },
  ) {
    return Api.post<ChannelMembersSaveRequest, ChannelMembersSaveResponse>(
      `${this.prefix}/${context.companyId}/workspaces/${context.workspaceId}/channels/${context.channelId}/members/${context.userId}`,
      {
        resource: { ...channelMember, ...partialsToUpdate },
      },
    ).then(result => result.resource);
  }

  /**
   * Get the channel members read sections.
   *
   * @param context - channel members read sections context
   * @returns {Promise<ChannelMemberReadSectionType[]>}
   */
  async getChannelMembersReadSections(context: {
    companyId: string;
    workspaceId: string;
    channelId: string;
  }): Promise<ChannelMemberReadSectionType[]> {
    return Api.get<{ resources: ChannelMemberReadSectionType[] }>(
      `${this.prefix}/${context.companyId}/workspaces/${context.workspaceId}/channels/${context.channelId}/members/read_sections`,
    ).then(({ resources }) => resources);
  }

  /**
   * Get the read sections for a specific member.
   *
   * @param context - channel member read sections context
   * @returns {Promise<ChannelMemberReadSectionType>}
   */
  async getChannelMemberReadSection(context: {
    companyId: string;
    workspaceId: string;
    channelId: string;
    userId: string;
  }): Promise<ChannelMemberReadSectionType> {
    return Api.get<{ resource: ChannelMemberReadSectionType }>(
      `${this.prefix}/${context.companyId}/workspaces/${context.workspaceId}/channels/${context.channelId}/members/${context.userId}/read_sections`,
    ).then(({ resource }) => resource);
  }
}
const ChannelCurrentMemberAPIClient = new ChannelCurrentMemberAPIClientService();

export default ChannelCurrentMemberAPIClient;
