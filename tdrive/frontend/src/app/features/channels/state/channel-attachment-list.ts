
import { MessageFileType } from 'app/features/messages/types/message';
import { atom, atomFamily } from 'recoil';

export type ChannelAttachment = {
  results: MessageFileType[];
  nextPage: string | null;
};

export const activeChannelAttachementListTabState = atom<number>({
  key: 'activeChannelAttachementListTabState',
  default: 0,
});

export const channelAttachmentListState = atom<boolean>({
  key: 'channelAttachmentListState',
  default: false,
});

export const channelAttachmentMediaState = atomFamily<ChannelAttachment, string>({
  key: 'channelAttachmentMediaState',
  default: () => ({ results: [], nextPage: '' }),
});

export const channelAttachmentFileState = atomFamily<ChannelAttachment, string>({
  key: 'channelAttachmentFileState',
  default: () => ({ results: [], nextPage: '' }),
});
