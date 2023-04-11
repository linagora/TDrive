import { MessageWithReplies } from 'app/features/messages/types/message';
import { atomFamily } from 'recoil';

export type AtomMessageKey = {
  companyId: string;
  threadId: string;
  id?: string;
  _status?: 'sending' | 'sent' | 'failed';
};
export type AtomThreadKey = { companyId: string; threadId: string };
export type AtomChannelKey = { companyId: string; workspaceId: string; channelId: string };

export const MessageState = atomFamily<MessageWithReplies, AtomMessageKey>({
  key: 'MessageState',
  default: () => {
    return {} as MessageWithReplies;
  },
});

export const ThreadMessagesState = atomFamily<
  (AtomMessageKey & { sortId?: string })[],
  AtomThreadKey
>({
  key: 'ThreadMessagesState',
  default: () => [],
});

export const ChannelMessagesState = atomFamily<
  (AtomMessageKey & { sortId?: string })[],
  AtomChannelKey
>({
  key: 'ChannelMessagesState',
  default: () => [],
});
