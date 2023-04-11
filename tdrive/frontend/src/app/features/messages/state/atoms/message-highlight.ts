import { atom } from 'recoil';

export type AtomHighlightKey = {
  threadId: string;
  answerId: string | null;
  reachedThread: boolean;
  reachedAnswer: boolean;
};

export const HighlightMessageState = atom<AtomHighlightKey | null>({
  key: 'HighlightMessageState',
  default: null,
});
