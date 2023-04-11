import { useRecoilValue, useSetRecoilState } from 'recoil'
import { MessageQuoteReplyEditorActiveSelector, MessageQuoteReplyEditorState } from '../state/atoms/message-quote-reply'

type MessageQuoteReplyType = {
  message: string;
  isActive: boolean;
  set: (payload: MessageQuoteReplyEditorState) => void;
  close: () => void;
}

/**
 * Manage the state of the message quote reply editor
 * 
 * @param {String} channel - The channel id to quote from
 */
export const useMessageQuoteReply = (channel = ''): MessageQuoteReplyType => {
  const set = useSetRecoilState(MessageQuoteReplyEditorState);
  const isActive = useRecoilValue(MessageQuoteReplyEditorActiveSelector({ channel }));
  const { message: messageId } = useRecoilValue(MessageQuoteReplyEditorState);

  return {
    isActive,
    set,
    close: () => set({ message: '', channel: '' }),
    message: messageId
  }
}
