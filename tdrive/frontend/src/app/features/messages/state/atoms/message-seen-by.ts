import { atom } from 'recoil';

export type MessageTarget = {
  message_id: string;
  thread_id: string;
  workspace_id: string;
  company_id: string;
}

export const messageSeenByListState = atom<boolean>({
  key: 'messageSeenByListState',
  default: false,
});

export const messageSeenByState = atom<MessageTarget | null>({
  key: 'messageSeenBystate',
  default: null,
});
