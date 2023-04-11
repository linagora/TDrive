import { MessageFileType } from 'app/features/messages/types/message';
import { atomFamily } from 'recoil';

export const PendingUploadZonesListState = atomFamily<MessageFileType[], string>({
  key: 'PendingUploadZonesListState',
  default: () => [],
});
