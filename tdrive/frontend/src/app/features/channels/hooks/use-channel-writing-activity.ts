/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRealtimeRoom } from 'app/features/global/hooks/use-realtime';
import WorkspaceAPIClient from 'app/features/workspaces/api/workspace-api-client';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import {
  ChannelWritingActivityState,
  ChannelWritingActivityType,
} from '../state/channel-writing-activity';

import { ThreadWritingActivitySelector } from '../../messages/state/selectors/thread-writing-activity';
import UserService from 'app/features/users/services/current-user-service';
import useRouterCompany from '../../router/hooks/use-router-company';
import { useCallback, useRef } from 'react';
import { useCurrentUser } from '../../users/hooks/use-current-user';

const MAX_DELAY_BETWEEN_KEYDOWN = 500;
const MIN_DELAY_BETWEEN_EMIT = 8000;
const MAX_DELAY_AFTER_LAST_WRITE_EVENT = 10000;

export type WritingEvent = {
  type: 'writing';
  event: {
    channel_id: string;
    thread_id: string;
    user_id: string;
    name: string;
    is_writing: boolean;
  };
};

export type ChannelWritingActivityTypeEmit = {
  iAmWriting: (writing: boolean) => void;
};

export function useChannelWritingActivityState(
  channelId: string,
  threadId?: string | null,
): ChannelWritingActivityType[] {
  const threadIdSelector = useRecoilValue(
    ThreadWritingActivitySelector({ channelId: channelId, threadId: threadId || '' }),
  );
  return threadIdSelector;
}

const receivedWritingTimeout = new Map<string, number>();

export default function useChannelWritingActivity() {
  const companyId = useRouterCompany();
  const { user } = useCurrentUser();

  const setChannelWritingActivityState = useRecoilCallback(
    ({ set, snapshot }) =>
      async (event: WritingEvent['event']) => {
        let currentList: ChannelWritingActivityType[] = await snapshot.getPromise(
          ChannelWritingActivityState(event.channel_id),
        );
        const newEvent: ChannelWritingActivityType = {
          threadId: event.thread_id,
          userId: event.user_id,
          name: event.name,
        };
        currentList = currentList.filter(elem => elem.userId !== newEvent.userId);
        if (event.is_writing) {
          currentList = [...currentList, newEvent];
        }
        currentList = currentList.filter(elem => elem.userId !== user?.id);
        set(ChannelWritingActivityState(event.channel_id), currentList);

        //Fallback stop is_writing in case of lost connection
        if (receivedWritingTimeout.has(event.user_id))
          clearTimeout(receivedWritingTimeout.get(event.user_id));
        if (event.is_writing) {
          receivedWritingTimeout.set(
            event.user_id,
            window.setTimeout(() => {
              setChannelWritingActivityState({ ...event, is_writing: false });
            }, MAX_DELAY_AFTER_LAST_WRITE_EVENT),
          );
        }
      },
  );

  useRealtimeRoom<WritingEvent>(
    WorkspaceAPIClient.websockets(companyId)[0],
    'useChannelWritingActivity',
    (action, resource) => {
      if (action === 'event' && resource.type === 'writing') {
        setChannelWritingActivityState(resource.event);
      }
    },
  );
}

export function useChannelWritingActivityEmit(
  channelId: string,
  threadId: string | null,
): ChannelWritingActivityTypeEmit {
  const companyId = useRouterCompany();
  const { user } = useCurrentUser();

  const { send } = useRealtimeRoom<WritingEvent>(
    WorkspaceAPIClient.websockets(companyId)[0],
    'useChannelWritingActivityEmit',
    () => undefined,
  );
  (window as any).send = send;

  const iAmWriting = useCallback(
    async (writing: boolean) => {
      if (user)
        send({
          type: 'writing',
          event: {
            channel_id: channelId,
            thread_id: threadId,
            user_id: user.id,
            name: UserService.getFullName(user),
            is_writing: writing,
          },
        } as WritingEvent);
    },
    [send],
  );
  return { iAmWriting };
}

/** Keyboard typeing detection helper */
let writeTimeout = setTimeout(() => {}, 0);
export const useWritingDetector = () => {
  const lastEmit = useRef(new Date().getTime());

  const onKeydown = useCallback((emit: (value: boolean) => unknown) => {
    const now = new Date().getTime();
    if (now - lastEmit.current > MIN_DELAY_BETWEEN_EMIT) {
      lastEmit.current = now;
      emit(true);
    }

    if (writeTimeout) {
      clearTimeout(writeTimeout);
    }
    writeTimeout = setTimeout(() => {
      emit(false);
      lastEmit.current = 0;
    }, MAX_DELAY_BETWEEN_KEYDOWN);
  }, []);

  return { onKeydown };
};
