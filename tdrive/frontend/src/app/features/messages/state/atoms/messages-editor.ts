/* eslint-disable @typescript-eslint/no-explicit-any */
import LocalStorage from 'app/features/global/framework/local-storage-service';
import { atom, selectorFamily, atomFamily } from 'recoil';

type MessagesEditorType = {
  value: string;
  files: any[];
};

type VisibleMessagesEditorLocationType = {
  location: string;
  subLocation: string;
};

/**
 * Store the current status of each editors by location
 * A location is:
 * - a message (being edited) message-{message_id}
 * - a new message input for a channel channel-{channel_id}
 * - a new message input for a thread (reply) thread-{thread_id}
 */
export const MessagesEditorState = atomFamily<MessagesEditorType, string>({
  key: 'MessagesEditorState',
  default: key => {
    let files = [];
    try {
      files = JSON.parse(LocalStorage.getItem(`editor:${key}:files`) || '[]') || [];
    } catch (err) {
      //Nothing
    }
    return { value: LocalStorage.getItem(`editor:${key}:value`) || '', files };
  },
  effects_UNSTABLE: key => [
    ({ onSet }) => {
      onSet((editor: MessagesEditorType) => {
        LocalStorage.setItem(`editor:${key}:files`, JSON.stringify(editor.files));
        LocalStorage.setItem(`editor:${key}:value`, editor.value || '');
      });
    },
  ],
});

/**
 * Store which editor is currently opened (only once at a time)
 * It returns a location and a subLocation if needed (editor in the thread view or editor in the main view for instance)
 * A location is:
 * - a message (being edited) message-{message_id}
 * - a new message input for a channel channel-{channel_id}
 * - a new message input for a thread (reply) thread-{thread_id}
 * A subLocation is:
 * - thread_view
 * - channel_view
 */
export const VisibleMessagesEditorLocationState = atom<VisibleMessagesEditorLocationType>({
  key: 'VisibleMessagesEditorLocationState',
  default: {
    location: LocalStorage.getItem(`editor:location`) || '',
    subLocation: LocalStorage.getItem(`editor:sublocation`) || '',
  },
  effects_UNSTABLE: [
    ({ onSet }) => {
      onSet((location: VisibleMessagesEditorLocationType) => {
        LocalStorage.setItem(`editor:location`, location.location);
        LocalStorage.setItem(`editor:sublocation`, location.subLocation);
      });
    },
  ],
});

export const VisibleMessagesEditorLocationActiveSelector = selectorFamily<
  boolean,
  VisibleMessagesEditorLocationType
>({
  key: 'VisibleMessagesEditorLocationActiveSelector',
  get:
    params =>
    ({ get }) => {
      const current = get(VisibleMessagesEditorLocationState);
      return current.location === params.location && current.subLocation === params.subLocation;
    },
});
