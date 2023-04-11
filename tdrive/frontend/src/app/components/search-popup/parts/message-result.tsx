/* eslint-disable @typescript-eslint/no-explicit-any */
import A from '@atoms/link';
import * as Text from '@atoms/text';
import { formatDate } from '@features/global/utils/format-date';
import { Message } from '@features/messages/types/message';
import ChannelAvatar from 'app/components/search-popup/parts/channel-avatar/channel-avatar';
import { useChannel } from 'app/features/channels/hooks/use-channel';
import { ChannelType } from 'app/features/channels/types/channel';
import useRouterWorkspace from 'app/features/router/hooks/use-router-workspace';
import { useSearchModal } from 'app/features/search/hooks/use-search';
import { SearchInputState } from 'app/features/search/state/search-input';
import { useUser } from 'app/features/users/hooks/use-user';
import { UserType } from 'app/features/users/types/user';
import { useState } from 'react';
import Highlighter from 'react-highlight-words';
import { useRecoilValue } from 'recoil';
import { openMessage } from '../common';
import MessageResultFile from './message-result-file';
import ResultContext from './result-context';

export default ({
  message,
}: {
  message: Message & { users?: UserType[]; channel?: ChannelType };
}) => {
  const input = useRecoilValue(SearchInputState);
  const currentWorkspaceId = useRouterWorkspace();
  const user =
    (message.users || []).find(u => u.id === message.user_id) || useUser(message.user_id || '');
  const channel = message.channel || useChannel(message?.cache?.channel_id || '').channel;
  const [truncated, setTruncated] = useState(true);
  const { setOpen } = useSearchModal();

  return (
    <div
      className="w-full flex items-start p-2 hover:bg-zinc-50 rounded-md cursor-pointer"
      onClick={() => {
        openMessage(message, currentWorkspaceId);
        setOpen(false);
      }}
    >
      <div className="mr-3">
        {channel && <ChannelAvatar channel={channel} showLabel={false} collapseToOne={true} />}
      </div>
      <div className="grow mr-3 overflow-hidden">
        <div className="messages-title overflow-hidden whitespace-nowrap text-ellipsis">
          <ResultContext
            user={user}
            context={{
              companyId: message?.cache?.company_id,
              workspaceId: message?.cache?.workspace_id,
              channelId: message?.cache?.channel_id,
            }}
          />
        </div>
        <div className="messages-text">
          <Text.BaseSmall className="block whitespace-pre-line">
            <Highlighter
              highlightClassName="text-blue-500 p-0 bg-blue-50"
              searchWords={input?.query?.split(' ')}
              autoEscape={true}
              textToHighlight={message.text?.substring(0, truncated ? 500 : message.text.length)}
            />
            {truncated && (message.text?.length || 0) > 500 && (
              <A
                className="ml-3"
                onClick={(e: any) => {
                  e.stopPropagation();
                  setTruncated(false);
                }}
              >
                See more
              </A>
            )}
          </Text.BaseSmall>
          {(message.files || []).map(file => (
            <div
              key={file.id}
              onClick={(e: any) => e.stopPropagation()}
              className="rounded-md border bg-white border-gray-200 hover:border-gray-300 mb-1"
            >
              <MessageResultFile file={{ ...file, message, user }} />
            </div>
          ))}
        </div>
        <Text.Info className="block">{formatDate(message.created_at)}</Text.Info>
      </div>
    </div>
  );
};
