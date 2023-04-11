import { getMessage } from 'app/features/messages/hooks/use-message';
import { AtomMessageKey } from 'app/features/messages/state/atoms/messages';
import { NodeMessage } from 'app/features/messages/types/message';

export type MessagesAndComponentsType = AtomMessageKey & {
  type: 'message' | 'timeseparator' | 'header' | 'locked';
  date?: number;
};

export const withNonMessagesComponents = (
  messages: AtomMessageKey[],
  reachedStart = false,
  shouldLimit = false,
) => {
  const newList: MessagesAndComponentsType[] = [];

  let first = true;
  let previous: NodeMessage | null = null;
  for (const k of messages) {
    const message = getMessage(k.id || '');
    if (first && shouldLimit) {
      newList.push({
        type: 'locked',
        ...k,
      });
      first = false;
    } else if (first && reachedStart) {
      newList.push({
        type: 'header',
        ...k,
      });
      first = false;
    }
    if (message) {
      if (previous !== undefined) {
        if (Math.abs((message?.created_at || 0) - (previous?.created_at || 0)) > 1000 * 60 * 60) {
          newList.push({
            type: 'timeseparator',
            date: message?.created_at || 0,
            ...k,
          });
        }
      }
      previous = message;
      newList.push({ type: 'message', ...k });
    }
  }

  return newList;
};
