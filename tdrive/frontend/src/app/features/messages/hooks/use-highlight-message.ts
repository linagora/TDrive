import { useGlobalEffect } from 'app/features/global/hooks/use-global-effect';
import useRouteState from 'app/features/router/hooks/use-route-state';
import { useRecoilState } from 'recoil';
import { HighlightMessageState } from '../state/atoms/message-highlight';

export const useHighlightMessage = () => {
  const [highlight, setHighlight] = useRecoilState(HighlightMessageState);
  const { threadId, messageId } = useRouteState();

  const cancelHighlight = () => {
    if (highlight?.reachedThread && (!highlight.answerId || highlight.reachedAnswer)) {
      setHighlight(null);
    }
  };

  const reachedHighlight = (type: 'thread' | 'answer' = 'thread') => {
    if (highlight) {
      setHighlight({
        ...highlight,
        ...(type === 'thread' ? { reachedThread: true } : {}),
        ...(type === 'answer' ? { reachedAnswer: true } : {}),
      });
    }
  };

  const updateHighlight = (highlight: { answerId: string | null; threadId: string }) => {
    if (highlight.answerId === highlight.threadId) highlight.answerId = null;
    setHighlight({ ...highlight, reachedThread: false, reachedAnswer: false });
  };

  useGlobalEffect(
    'useHighlightMessage',
    () => {
      if (threadId) updateHighlight({ answerId: messageId || null, threadId });
    },
    [threadId, messageId],
  );

  return {
    highlight,
    updateHighlight,
    cancelHighlight,
    reachedHighlight,
  };
};
