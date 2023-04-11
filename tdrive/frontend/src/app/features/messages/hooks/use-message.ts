import MessageAPIClient from 'app/features/messages/api/message-api-client';
import _ from 'lodash';
import User from 'app/features/users/services/current-user-service';
import { useRecoilCallback, useRecoilState } from 'recoil';
import { AtomMessageKey, MessageState } from '../state/atoms/messages';
import { NodeMessage, NodeMessageSubType, ReactionType } from 'app/features/messages/types/message';
import { messageToMessageWithReplies } from '../utils/message-with-replies';
import { useSetUserList } from 'app/features/users/hooks/use-user-list';

export const useMessage = (partialKey: AtomMessageKey) => {
  const key = {
    ..._.pick(partialKey, 'threadId', 'companyId'),
    id: partialKey.id || partialKey.threadId,
  };
  const setValue = useSetMessage(key.companyId);
  const [message] = useRecoilState(MessageState(key));

  const get = async () => {
    const message = await MessageAPIClient.get(
      partialKey.companyId,
      partialKey.threadId,
      partialKey.id || '',
    );
    if (message) {
      setValue(message);
    }
  };

  const save = async (message: NodeMessage) => {
    const updated = await MessageAPIClient.save(partialKey.companyId, partialKey.threadId, message);
    if (updated) setValue(messageToMessageWithReplies(updated));
  };

  const move = async (targetThread: string) => {
    const updated = await MessageAPIClient.save(
      partialKey.companyId,
      partialKey.threadId,
      { ...message, thread_id: targetThread },
      { movedFromThread: message.thread_id },
    );
    if (updated) setValue(messageToMessageWithReplies(updated));
  };

  const remove = async () => {
    if (message?.ephemeral?.id) {
      return;
    }

    //Three lines to make it instant on frontend
    const quickUpdated = _.cloneDeep(message);
    quickUpdated.subtype = NodeMessageSubType.DELETED;
    setValue(quickUpdated);

    const updated = await MessageAPIClient.delete(
      partialKey.companyId,
      partialKey.threadId,
      partialKey.id || '',
    );
    if (updated) setValue(messageToMessageWithReplies(updated));
  };

  const bookmark = async (bookmarkId: string, status = true) => {
    const updated = await MessageAPIClient.bookmark(
      partialKey.companyId,
      partialKey.threadId,
      partialKey.id || '',
      bookmarkId,
      status,
    );
    if (updated) setValue(messageToMessageWithReplies(updated));
  };

  const pin = async (status = true) => {
    //Three lines to make it instant on frontend
    const quickUpdated = _.cloneDeep(message);
    quickUpdated.pinned_info = {
      pinned_at: new Date().getTime(),
      pinned_by: User.getCurrentUserId(),
    };
    setValue(quickUpdated);

    const updated = await MessageAPIClient.pin(
      partialKey.companyId,
      partialKey.threadId,
      partialKey.id || '',
      status,
    );
    if (updated) setValue(messageToMessageWithReplies(updated));
  };

  const react = async (
    emojis: string[],
    mode: 'add' | 'toggle' | 'remove' | 'replace' = 'toggle',
  ) => {
    let userReactions = (message.reactions || [])
      ?.filter(r => r.users.includes(User.getCurrentUserId()))
      .map(e => e.name);

    if (mode === 'replace') {
      userReactions = emojis;
    } else {
      emojis.forEach(emoji => {
        if (mode === 'add') {
          userReactions = [...userReactions, emoji];
        } else if (mode === 'remove') {
          userReactions = userReactions.filter(e => emoji !== e);
        } else if (mode === 'toggle') {
          const existing = userReactions.filter(e => emoji === e);
          userReactions = [
            ...userReactions.filter(e => !emojis.includes(e)),
            ...emojis.filter(e => !existing.includes(e)),
          ];
        }
      });
    }

    //Three lines to make it instant on frontend
    const quickUpdated = _.cloneDeep(message);
    quickUpdated.reactions = recomputeReactions(
      _.cloneDeep(message.reactions) || [],
      userReactions,
    );
    setValue(quickUpdated);

    const updated = await MessageAPIClient.reaction(
      partialKey.companyId,
      partialKey.threadId,
      partialKey.id || '',
      _.uniq(userReactions),
    );
    if (updated) setValue(messageToMessageWithReplies(updated));
  };

  /**
   * Delete a preview for given url
   * 
   * @param {String} url - the url corresponding to the preview to delete
   * @returns {Promise<void>}
   */
  const deleteLinkPreview = async (url: string): Promise<void> => {
    const updated = await MessageAPIClient.deleteLinkPreview(
      partialKey.companyId,
      partialKey.threadId,
      partialKey.id || '',
      url,
    );

    if (updated) setValue(messageToMessageWithReplies(updated));
  };

  return { message, get, react, pin, remove, bookmark, save, move, deleteLinkPreview };
};

//Function to recompute reactions after a frontend operation
const recomputeReactions = (reactions: ReactionType[], selected: string[]) => {
  const existingNames = reactions.map(e => e.name);
  const existingUserReactions = (reactions || [])
    ?.filter(r => r.users.includes(User.getCurrentUserId()))
    .map(e => e.name);

  selected.forEach(emoji => {
    if (!existingUserReactions.includes(emoji)) {
      if (!existingNames.includes(emoji)) {
        reactions.push({ name: emoji, count: 1, users: [User.getCurrentUserId()] });
      } else {
        reactions = reactions.map(r => {
          if (r.name === emoji) {
            r.count++;
            r.users.push(User.getCurrentUserId());
          }
          return r;
        });
      }
    }
  });

  existingUserReactions.forEach(emoji => {
    if (!selected.includes(emoji)) {
      reactions = reactions
        .map(r => {
          if (r.name === emoji) {
            r.count--;
            r.users = r.users.filter(u => u !== User.getCurrentUserId());
          }
          return r;
        })
        .filter(r => r.count > 0);
    }
  });

  return reactions;
};

const messagesStore: { [key: string]: NodeMessage } = {};

export const getMessage = (id: string) => {
  return messagesStore[id];
};

export const useSetMessage = (companyId: string) => {
  const { set: setUserList } = useSetUserList('useSetMessage');

  return useRecoilCallback(
    ({ set }) =>
      async (message: NodeMessage) => {
        const storedMessage = messagesStore[message.id];

        if (storedMessage && storedMessage?.status) {
          if (
            (storedMessage.status == 'delivered' && message.status === 'sent') ||
            (storedMessage.status === 'read' &&
              (message.status === 'delivered' || message.status === 'sent'))
          ) {
            return;
          }
        }

        messagesStore[message.id] = message;

        set(
          MessageState({ threadId: message.thread_id, id: message.id, companyId: companyId }),
          messageToMessageWithReplies(message),
        );

        if (message.users) setUserList(message.users);
      },
    [companyId],
  );
};
