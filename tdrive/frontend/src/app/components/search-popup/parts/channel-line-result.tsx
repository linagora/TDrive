import * as Text from '@atoms/text';
import { ChannelType } from 'app/features/channels/types/channel';
import useRouterWorkspace from 'app/features/router/hooks/use-router-workspace';
import { useSearchModal } from 'app/features/search/hooks/use-search';
import { SearchInputState } from 'app/features/search/state/search-input';
import ChannelAvatar from 'app/components/search-popup/parts/channel-avatar/channel-avatar';
import Highlighter from 'react-highlight-words';
import { useRecoilValue } from 'recoil';
import { openChannel } from '../common';
import { Button } from 'app/atoms/button/button';
import Languages from 'app/features/global/services/languages-service';
import { useChannel } from 'app/features/channels/hooks/use-channel';
import { useChannelNotifications } from 'app/features/users/hooks/use-notifications';
import { Badge } from '@atoms/badge';
import UserService from 'features/users/services/current-user-service';
import ResultContext from './result-context';
import _ from 'lodash';

type PropsType = {
  channel: ChannelType;
};

export default ({ channel: _channel }: PropsType): JSX.Element => {
  const channel =
    (_channel.visibility !== 'direct'
      ? useChannel(_channel.id || '', {
          companyId: _channel.company_id || '',
          workspaceId: _channel.workspace_id || '',
        })?.channel
      : undefined) || _channel;
  const currentWorkspaceId = useRouterWorkspace();
  const input = useRecoilValue(SearchInputState);
  const name =
    channel.name ||
    _.uniqBy(channel.users || [], 'id')
      .filter(u => u.id != UserService.getCurrentUserId() || channel.users?.length === 1)
      .map(u => UserService.getFullName(u).trim())
      .join(', ');
  const { setOpen } = useSearchModal();

  const notifications = useChannelNotifications(channel.id || '');

  return (
    <div
      className="flex items-center p-2 hover:bg-zinc-50 rounded-md cursor-pointer"
      onClick={() => {
        openChannel(channel, currentWorkspaceId);
        setOpen(false);
      }}
    >
      <div className="mr-3">
        <ChannelAvatar channel={channel} showLabel={false} collapseToOne={true} />
      </div>
      <div className="grow mr-3 overflow-hidden text-ellipsis whitespace-nowrap">
        <Text.Base className="block overflow-hidden text-ellipsis whitespace-nowrap">
          <Highlighter
            highlightClassName="text-blue-500 p-0 bg-blue-50 overflow-hidden text-ellipsis whitespace-nowrap"
            searchWords={input?.query?.split(' ')}
            autoEscape={true}
            textToHighlight={name}
          />
        </Text.Base>
        <Text.Info className="block">
          {channel?.stats?.members || channel.users?.length || 0} members
        </Text.Info>
        <ResultContext context={{ workspaceId: channel.workspace_id || '' }} />
      </div>
      <div className="text-right">
        {!channel.user_member && (
          <>
            <Button theme="outline">Preview</Button>
            <br />
            <Text.Info>
              {Languages.t(
                'scenes.client.channelsbar.modals.workspace_channel_list.workspace_channel_row.tag',
              )}
            </Text.Info>
          </>
        )}
        {!!channel.user_member && (notifications?.badges?.length || 0) > 0 && (
          <>
            <Badge size="sm" className="rounded-full px-2.5" theme="primary">
              {notifications.badges.length}
            </Badge>
          </>
        )}
      </div>
    </div>
  );
};
