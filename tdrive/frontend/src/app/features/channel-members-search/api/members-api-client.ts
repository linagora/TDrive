import { ChannelMemberType } from 'app/features/channel-members-search/types/channel-members';
import Api from 'app/features/global/framework/api-service';
import { TdriveService } from 'app/features/global/framework/registry-decorator-service';
import { WebsocketRoom } from 'app/features/global/types/websocket-types';
import {
  ParamsChannelMember,
  PayloadChannelMemberType,
  ResponseChannelMemberType,
  ResponseChannelMemberTypeList,
} from '../types/channel-members';

@TdriveService('ChannelMemberAPIClientService')
class ChannelMembersApiClient {
  private readonly apiBaseUrl: string = '/internal/services/channels/v1/companies';
  private _realtime: WebsocketRoom = { room: '', token: '' };
  public get realtime(): WebsocketRoom {
    return this._realtime;
  }
  public set realtime(value: WebsocketRoom) {
    this._realtime = value;
  }

  async getMembers(params: ParamsChannelMember, search?: string) {
    console.log('getMembers ....', params);
    return Api.get<ResponseChannelMemberTypeList>(
      `${this.apiBaseUrl}/${params.companyId}/workspaces/${params.workspaceId}/channels/${
        params.channelId
      }/members?websockets=1${search ? `&search=${search}` : ''}`,
    ).then(({ websockets, resources }) => {
      if (websockets) this.realtime = websockets[0];
      return resources;
    });
  }

  async addMember(member: Partial<ChannelMemberType>, params: ParamsChannelMember) {
    return Api.post<PayloadChannelMemberType, ResponseChannelMemberType>(
      `${this.apiBaseUrl}/${params.companyId}/workspaces/${params.workspaceId}/channels/${params.channelId}/members`,
      { resource: member },
    ).then(({ resource }) => resource);
  }

  async deleteMember(memberId: string, params: ParamsChannelMember) {
    return Api.delete<ResponseChannelMemberType>(
      `${this.apiBaseUrl}/${params.companyId}/workspaces/${params.workspaceId}/channels/${params.channelId}/members/${memberId}`,
    ).then(({ resource }) => {
      return resource;
    });
  }
}

export default new ChannelMembersApiClient();
