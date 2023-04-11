import { NodeMessage } from 'app/features/messages/types/message';
import routerService from 'app/features/router/services/router-service';

/**
 * Go to a specific message.
 * 
 * @param {NodeMessage} message - The message to scroll to
 * @param {String} companyId - The company id
 * @param {String} channelId - The channel id
 * @param {String} workspaceId - The workspace id
 */
export const gotoMessage = (message: NodeMessage, companyId: string, channelId: string, workspaceId: string): void => {
  routerService.push(
    routerService.generateRouteFromState({
      companyId,
      channelId,
      workspaceId,
      threadId: message.thread_id,
    }),
  );
};
