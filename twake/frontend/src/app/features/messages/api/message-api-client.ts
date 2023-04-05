import { TdriveService } from '../../global/framework/registry-decorator-service';
import {
  Message,
  MessageExtended,
  MessageFileType,
  MessageSeenType,
  MessageWithReplies,
  NodeMessage,
} from 'app/features/messages/types/message';
import MessageViewAPIClient from './message-view-api-client';
import MessageThreadAPIClient from './message-thread-api-client';
import Api from 'app/features/global/framework/api-service';
import { WebsocketRoom } from 'app/features/global/types/websocket-types';
import Numbers from 'app/features/global/utils/Numbers';
import { MetaDataType } from 'features/files/types/file';
import Workspace from 'app/deprecated/workspaces/workspaces';
import Logger from 'features/global/framework/logger-service';
import { UserType } from 'features/users/types/user';
import { AtomMessageKey } from '../state/atoms/messages';

/**
 * This service is to get, update, create, list messages in a thread
 */

export interface BaseSearchOptions {
  company_id?: string;
  workspace_id?: string;
  channel_id?: string;
  page_token?: string;
  limit?: number;
}

export interface FileSearchOptions extends BaseSearchOptions {
  sender?: string;
  is_file?: boolean;
  is_media?: boolean;
  extension?: string;
  workspace_id?: string;
  channel_id?: string;
  next_page_token?: string;
}

@TdriveService('MessageAPIClientService')
class MessageAPIClient {
  private readonly prefixUrl: string = '/internal/services/messages/v1';
  private realtime: Map<string, WebsocketRoom[]> = new Map();
  private readonly _viewService = MessageViewAPIClient;
  private readonly threadService = MessageThreadAPIClient;
  private logger = Logger.getLogger('MessageAPIClientService');

  websockets(threadId: string): WebsocketRoom[] {
    return this.realtime.get(threadId) || [];
  }

  async list(
    companyId: string,
    threadId: string,
    {
      limit = 25,
      pageToken = '',
      direction = 'future',
    }: { limit?: number; pageToken?: string; direction?: 'future' | 'history' } = {},
  ) {
    const response = await Api.get<{ resources: NodeMessage[]; websockets: WebsocketRoom[] }>(
      `${this.prefixUrl}/companies/${companyId}/threads/${threadId}/messages?limit=${limit}&include_users=1&page_token=${pageToken}&direction=${direction}`,
    );
    this.realtime.set(threadId, response.websockets);
    return (response.resources || []).sort((a, b) => Numbers.compareTimeuuid(a.id, b.id));
  }

  async get(companyId: string, threadId: string, messageId: string) {
    const response = await Api.get<{ resource: MessageWithReplies }>(
      `${this.prefixUrl}/companies/${companyId}/threads/${threadId}/messages/${messageId}?include_users=1`,
    );
    return response.resource;
  }

  async reaction(companyId: string, threadId: string, messageId: string, reactions: string[] = []) {
    const response = await Api.post<{ reactions: string[] }, { resource: NodeMessage }>(
      `${this.prefixUrl}/companies/${companyId}/threads/${threadId}/messages/${messageId}/reaction`,
      { reactions },
    );
    return response.resource;
  }

  async bookmark(
    companyId: string,
    threadId: string,
    messageId: string,
    bookmarkId: string,
    active = true,
  ) {
    const response = await Api.post<
      { bookmark_id: string; active: boolean },
      { resource: NodeMessage }
    >(
      `${this.prefixUrl}/companies/${companyId}/threads/${threadId}/messages/${messageId}/bookmark`,
      { bookmark_id: bookmarkId, active },
    );
    return response.resource;
  }

  async pin(companyId: string, threadId: string, messageId: string, pin = true) {
    const response = await Api.post<{ pin: boolean }, { resource: NodeMessage }>(
      `${this.prefixUrl}/companies/${companyId}/threads/${threadId}/messages/${messageId}/pin`,
      { pin },
    );
    return response.resource;
  }

  async delete(companyId: string, threadId: string, messageId: string) {
    const response = await Api.post<unknown, { resource: NodeMessage }>(
      `${this.prefixUrl}/companies/${companyId}/threads/${threadId}/messages/${messageId}/delete`,
      {},
    );
    return response.resource;
  }

  async save(
    companyId: string,
    threadId: string,
    message: Partial<NodeMessage>,
    {
      movedFromThread = undefined,
    }: {
      movedFromThread?: string;
    } = {},
  ) {
    const response = await Api.post<
      { resource: Partial<NodeMessage>; options: { previous_thread?: string } },
      { resource: NodeMessage }
    >(
      `${this.prefixUrl}/companies/${companyId}/threads/${threadId}/messages${
        message.id ? '/' + message.id : ''
      }`,
      { resource: message, options: { previous_thread: movedFromThread } },
    );
    return response.resource;
  }

  async download(messageFile: MessageFileType) {
    if (messageFile.thread_id)
      await Api.post(
        `${this.prefixUrl}/companies/${messageFile.company_id}/threads/${messageFile.thread_id}/messages/${messageFile.message_id}/download/${messageFile.id}`,
        {},
      );
  }

  /**
   * Delete a link preview from a message
   *
   * @param {String} companyId - The company id
   * @param {String} threadId - The thread id
   * @param {String} messageId - The message id
   * @param {String} url - The url to delete from the previews
   * @returns {Promise<void>}
   */
  async deleteLinkPreview(companyId: string, threadId: string, messageId: string, url: string) {
    const response = await Api.post<{ url: string }, { resource: NodeMessage }>(
      `${this.prefixUrl}/companies/${companyId}/threads/${threadId}/messages/${messageId}/deletelink`,
      { url },
    );

    return response.resource;
  }

  async search(searchString: string, options?: BaseSearchOptions) {
    const companyId = options?.company_id ? options.company_id : Workspace.currentGroupId;
    const query = `/internal/services/messages/v1/companies/${companyId}/search?q=${searchString}&include_users=1`;
    const res = await Api.getWithParams<{ resources: MessageExtended[] }>(query, options);
    this.logger.debug(
      `Message search by text "${searchString}". Found`,
      res.resources.length,
      'messages',
    );

    return res;
  }

  async searchFile(searchString: string | null, options?: FileSearchOptions) {
    try {
      const companyId = options?.company_id ? options.company_id : Workspace.currentGroupId;
      let query = `/internal/services/messages/v1/companies/${companyId}/files/search`;
      if (searchString) {
        query += `?q=${searchString}`;
      }
      const res = await Api.getWithParams<{
        resources: (MessageFileType & {
          company_id: string;
          metadata: MetaDataType;
          created_at: number;
          message: Message;
          user: UserType;
        })[];
        next_page_token: string;
      }>(query, options);

      return {
        resources: res.resources,
        next_page_token: res.next_page_token,
      };
    } catch (e) {
      return { resources: [], next_page_token: null };
    }
  }

  /**
   * Mark messages as seen
   *
   * @param {String} companyId - The company id
   * @param {String} channelId - The channel
   * @param {String} workspaceId - the workspace
   * @param {AtomMessageKey[]} messages - the messages to mark as seen
   * @returns {Promise<boolean>} - true if the messages were marked as seen
   */
  async read(
    companyId: string,
    channelId: string,
    workspaceId: string,
    messages: AtomMessageKey[],
  ): Promise<boolean> {
    if (!messages || !messages.length) {
      return true;
    }

    const body = {
      messages: messages.map(message => ({
        thread_id: message.threadId,
        message_id: message.id || message.threadId,
      })),
      channel_id: channelId,
    };

    return await Api.post<MessageSeenType, boolean>(
      `${this.prefixUrl}/companies/${companyId}/workspaces/${workspaceId}/threads/read`,
      body,
    );
  }

  /**
   * List the users who've seen the message
   *
   * @param {String} messageId - the message id
   * @param {String} companyId - the company id
   * @param {String} workspaceId - the workspace id
   * @returns {Promise<UserType[]>} - the users list
   */
  async seenBy(
    messageId: string,
    threadId: string,
    companyId: string,
    workspaceId: string,
  ): Promise<UserType[]> {
    const { resources } = await Api.get<{ resources: UserType[] }>(
      `${this.prefixUrl}/companies/${companyId}/workspaces/${workspaceId}/threads/${threadId}/messages/${messageId}/seen`,
    );

    return resources;
  }
}

export default new MessageAPIClient();
