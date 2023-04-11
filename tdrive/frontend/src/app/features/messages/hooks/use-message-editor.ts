/* eslint-disable @typescript-eslint/no-explicit-any */
import { MessageWithReplies, NodeMessage, QuotedMessageType } from 'app/features/messages/types/message';
import MessageAPIClient from 'app/features/messages/api/message-api-client';
import {} from 'app/features/global/hooks/use-realtime';
import _ from 'lodash';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  MessagesEditorState,
  VisibleMessagesEditorLocationActiveSelector,
  VisibleMessagesEditorLocationState,
} from '../state/atoms/messages-editor';
import { getMessage, useMessage, useSetMessage } from './use-message';
import { v1 as uuidv1 } from 'uuid';
import MessageThreadAPIClient from 'app/features/messages/api/message-thread-api-client';
import Login from 'app/features/auth/login-service';
import { messageToMessageWithReplies } from '../utils/message-with-replies';
import { useAddMessageToChannel, useRemoveMessageFromChannel } from './use-channel-messages';
import { useAddMessageToThread, useRemoveMessageFromThread } from './use-thread-messages';
import { useRef } from 'react';
import { AtomMessageKey } from '../state/atoms/messages';
import { MessagesAndComponentsType } from 'app/features/messages/hooks/with-non-messages-components';
import { useMessageQuoteReply } from './use-message-quote-reply';

export type EditorKey = {
  companyId: string;
  workspaceId?: string;
  channelId?: string;
  threadId?: string;
  messageId?: string;
};

export const useMessageEditor = (key: EditorKey) => {
  const location = key.messageId
    ? `edit-${key.messageId}`
    : key.threadId
    ? `reply-${key.threadId}`
    : `new-${key.channelId}`;
  const [editor, setEditor] = useRecoilState(MessagesEditorState(location));
  const editorRef = useRef(editor);
  const { isActive: isQuoted, message: quotedMessageId, close: closeQuoteReply } = useMessageQuoteReply(key.channelId || '');
  let quotedMessage: MessageWithReplies | null = null;

  quotedMessage = useMessage({
    companyId: key.companyId,
    threadId: quotedMessageId,
    id: quotedMessageId
  }).message;

  const propagateMessage = useAddMessageFromEditor(key);

  const send = async (message?: Partial<NodeMessage>) => {
    if (!message) {
      message = {
        text: editorRef.current.value,
        files: editorRef.current.files,
      };
    }

    setEditorRef({ value: '', files: [] });

    const editedMessage = {
      thread_id: key.threadId || uuidv1(),
      created_at: new Date().getTime(),
      user_id: Login.currentUserId,
      context: {
        _front_id: uuidv1(),
      },
      ...message,
    } as NodeMessage;

    if (isQuoted && quotedMessage) {
      editedMessage.quote_message = quotedMessage as unknown as QuotedMessageType;
      closeQuoteReply();
    }

    const tempMessage: NodeMessage = {
      ...editedMessage,
      _status: 'sending',
      id: key.threadId ? uuidv1() : editedMessage.thread_id,
      status: 'sending'
    };
    propagateMessage(tempMessage as NodeMessage);

    try {
      let newMessage = null;
      if (key.threadId || key.messageId) {
        newMessage = await MessageAPIClient.save(key.companyId, key.threadId || '', editedMessage);
      } else {
        newMessage = await MessageThreadAPIClient.save(key.companyId, {
          message: editedMessage,
          participants: [
            {
              type: 'channel',
              id: key.channelId || '',
              company_id: key.companyId,
              workspace_id: key.workspaceId || '',
            },
          ],
        });
      }
      if (!newMessage) {
        throw new Error('Not sent');
      }
      
      propagateMessage({ ...tempMessage, _status: 'sent', status: 'sent' });
      propagateMessage({ ...newMessage, _status: 'sent' });
    } catch (err) {
      propagateMessage({ ...tempMessage, _status: 'failed', status: 'error' });
    }
  };

  const retry = async (message: MessageWithReplies) => {
    propagateMessage({ ...message, _status: 'cancelled' });
    //Fixme, to do the update we use the recoil snapshot that is not updated between two changes
    window.requestAnimationFrame(() => send({ ...message, id: undefined, _status: undefined }));
  };

  const cancel = (message: MessageWithReplies) => {
    propagateMessage({ ...message, _status: 'cancelled' });
  };

  const setEditorRef = (editor: { value: string; files: any[] }) => {
    editorRef.current = editor;
    setEditor(editorRef.current);
  };

  return {
    editor,
    key: location,
    send,
    retry,
    cancel,
    setEditor: setEditorRef,
    setValue: (value: string) => setEditorRef({ ...editor, value }),
    setFiles: (files: any[]) => setEditorRef({ ...editor, files }),
  };
};

/**
 * Remove sent messages from the list
 * as we have a duplication between frontend message and server message
 */
export const cleanFrontMessagesFromListOfMessages = (
  messages: (AtomMessageKey | MessagesAndComponentsType)[],
) => {
  messages = messages.filter(i => {
    if (getMessage(i.id || '') && getMessage(i.id || '')?._status !== 'sent') return true;

    if (getMessage(i.id || '')?._status !== undefined) {
      //This message was created in frontend
      //If this message was retrieved from the backend, then we should not keep the frontend one
      return !messages.find(
        j =>
          getMessage(j.id || '')?.context?._front_id ===
            getMessage(i.id || '')?.context?._front_id && j.id !== i.id,
      );
    }
  });
  messages = _.uniqBy(
    messages,
    a =>
      (a as MessagesAndComponentsType)?.type +
      (getMessage(a.id || '')?.context?._front_id || a?.id),
  );
  return messages;
};

export const useVisibleMessagesEditorLocation = (location: string, subLocation = '') => {
  const set = useSetRecoilState(VisibleMessagesEditorLocationState);
  const active = useRecoilValue(
    VisibleMessagesEditorLocationActiveSelector({ location, subLocation }),
  );
  return {
    active,
    set,
    close: () => {
      set({ location: '', subLocation: '' });
    },
  };
};

export const useAddMessageFromEditor = (key: {
  companyId: string;
  workspaceId?: string;
  channelId?: string;
}) => {
  const addToThread = useAddMessageToThread(key.companyId);
  const removeFromThread = useRemoveMessageFromThread(key.companyId);
  const channelKey = {
    companyId: key.companyId,
    workspaceId: key.workspaceId || '',
    channelId: key.channelId || '',
  };
  const addToChannel = useAddMessageToChannel(channelKey);
  const removeFromChannel = useRemoveMessageFromChannel(channelKey);
  const setMessage = useSetMessage(key.companyId);

  return (message: NodeMessage) => {
    const isThread = message.thread_id === message.id;

    setMessage(messageToMessageWithReplies(message));
    if (message._status === 'sent' || message._status === 'cancelled') {
      if (!isThread) removeFromThread([message], { threadId: message.thread_id });
      if (isThread) removeFromChannel([message]);
    } else {
      if (!isThread) addToThread([message], { atBottom: true, threadId: message.thread_id });
      if (isThread) addToChannel([message], { atBottom: true });
    }
  };
};
