import LocalStorage from 'app/features/global/framework/local-storage-service';
import { atom, selectorFamily } from 'recoil';

export type MessageQuoteReplyEditorState = {
  message: string;
  channel: string;
};

type MessageQuoteReplyEditorActiveSelectorType = {
  channel: string;
};

export const MessageQuoteReplyEditorState = atom<MessageQuoteReplyEditorState>({
  key: 'MessageQuoteReplyEditorState',
  default: {
    message: LocalStorage.getItem(`quote-reply:message`) || '',
    channel: LocalStorage.getItem(`quote-reply:channel`) || '',
  },
  effects_UNSTABLE: [
    ({ onSet }) => {
      onSet((payload: MessageQuoteReplyEditorState) => {
        LocalStorage.setItem(`quote-reply:message`, payload.message || '');
        LocalStorage.setItem(`quote-reply:channel`, payload.channel || '');
      });
    }
  ],
});

export const MessageQuoteReplyEditorActiveSelector = selectorFamily<
  boolean,
  MessageQuoteReplyEditorActiveSelectorType
>({
  key: 'MessageQuoteReplyEditorActiveSelector',
  get:
    params =>
    ({ get }) => {
      const { channel, message } = get(MessageQuoteReplyEditorState);

      return message !== '' && channel !== '' && params.channel === channel;
    },
});
