import { MessageWithReplies, NodeMessage } from 'app/features/messages/types/message';

/**
 * This convert a NodeMessage to a MessageWithReply type to make things easier
 */
export const messageToMessageWithReplies = (m: NodeMessage | MessageWithReplies) => {
  const mwr: MessageWithReplies = {
    ...m,
    last_replies: (m as MessageWithReplies)?.last_replies || [],
    stats: (m as MessageWithReplies)?.stats || { last_activity: m.created_at, replies: 0 },
  };
  return mwr;
};
