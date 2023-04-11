import { MessageWithReplies, NodeMessage } from 'app/features/messages/types/message';
import MessageViewAPIClient from 'app/features/messages/api/message-view-api-client';
import { useRealtimeRoom } from 'app/features/global/hooks/use-realtime';
import CurrentUser from 'app/deprecated/user/CurrentUser';
import { atomFamily, useRecoilCallback, useRecoilState } from 'recoil';
import { useSetMessage } from './use-message';
import { v4 as uuidv4 } from 'uuid';
const EphemeralMessageState = atomFamily<NodeMessage | null, string>({
  key: 'EphemeralMessageState',
  default: () => null,
});

export const useEphemeralMessages = (key: { companyId: string; channelId: string }) => {
  const [lastEphemeral, setLastEphemeral] = useRecoilState(EphemeralMessageState(key.channelId));
  const getLastEphemeral = useRecoilCallback(
    ({ snapshot }) =>
      (key: { companyId: string; channelId: string }) => {
        return snapshot.getLoadable(EphemeralMessageState(key.channelId)).valueMaybe();
      },
  );
  const setMessage = useSetMessage(key.companyId);

  useRealtimeRoom<MessageWithReplies>(
    MessageViewAPIClient.feedWebsockets(key.channelId)[0],
    'useEphemeralMessages',
    async (action: string, event: NodeMessage) => {
      if (action === 'created' || action === 'updated') {
        const message = event as NodeMessage;
        const lastEphemeral = getLastEphemeral(key);
        if (message.ephemeral) {
          message.id = uuidv4();
          message.thread_id = message.thread_id || message.id || uuidv4();
          if (
            message.subtype === 'deleted' &&
            (message.id === lastEphemeral?.id ||
              (message.ephemeral.id && message.ephemeral.id === lastEphemeral?.ephemeral?.id) ||
              message.ephemeral.recipient === CurrentUser.get().id)
          ) {
            setLastEphemeral(null);
          } else if (
            message.ephemeral.recipient === CurrentUser.get().id &&
            (!message.ephemeral.recipient_context_id ||
              message.ephemeral.recipient_context_id === CurrentUser.unique_connection_id)
          ) {
            setMessage(message);
            setLastEphemeral(message);
          }
          return;
        }
      }
    },
  );

  return {
    lastEphemeral,
    remove: () => setLastEphemeral(null),
  };
};
