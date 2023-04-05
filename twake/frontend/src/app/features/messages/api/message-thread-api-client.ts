import {
  NodeMessage,
  Thread,
  Participant,
  MessageWithReplies,
} from 'app/features/messages/types/message';
import Api from 'app/features/global/framework/api-service';
import { TdriveService } from 'app/features/global/framework/registry-decorator-service';

/**
 * This service is to create and update a thread
 */
@TdriveService('MessageThreadAPIClient')
class MessageThreadAPIClient {
  private readonly prefixUrl: string = '/internal/services/messages/v1';

  buildChannelParticipant(companyId: string, workspaceId: string, channelId: string) {
    return {
      type: 'channel',
      company_id: companyId,
      workspace_id: workspaceId,
      id: channelId,
    } as Participant;
  }

  async save(
    companyId: string,
    options: { message: NodeMessage; participants?: Participant[] },
  ): Promise<MessageWithReplies> {
    const response = await Api.post<
      { resource: { participants: Participant[] }; options: { message: NodeMessage } },
      { resource: Thread & { message: NodeMessage } }
    >(`${this.prefixUrl}/companies/${companyId}/threads`, {
      resource: { participants: options.participants || [] },
      options: { message: options.message },
    });
    return {
      ...response.resource.message,
      last_replies: [],
      stats: {
        last_activity: response.resource.created_at,
        replies: 0,
      },
    };
  }

  async participants(
    companyId: string,
    threadId: string,
    participants: { add: Participant[]; remove: Participant[] },
  ) {
    const response = await Api.post<
      { resource: unknown; options: { participants: { add: Participant[]; remove: Participant[] } } },
      { resource: Thread }
    >(`${this.prefixUrl}/companies/${companyId}/threads/${threadId}`, {
      resource: {},
      options: { participants: participants },
    });
    return response.resource;
  }
}

export default new MessageThreadAPIClient();
