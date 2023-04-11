import { useRecoilState } from 'recoil';
import {
  messageSeenByListState,
  messageSeenByState,
  MessageTarget,
} from '../state/atoms/message-seen-by';

type MessageSeenByType = {
  openSeenBy: (target: MessageTarget) => void;
  isOpen: boolean;
  closeSeenBy: () => void;
  seenMessage: MessageTarget | null;
};

export const useMessageSeenBy = (): MessageSeenByType => {
  const [isOpen, setOpen] = useRecoilState(messageSeenByListState);
  const [seenMessage, setTarget] = useRecoilState(messageSeenByState);

  const openSeenBy = ({ message_id, thread_id, company_id, workspace_id }: MessageTarget): void => {
    setTarget({
      message_id,
      company_id,
      thread_id,
      workspace_id,
    });
    setOpen(true);
  };
  return {
    openSeenBy,
    seenMessage,
    isOpen,
    closeSeenBy: () => setOpen(false),
  };
};
