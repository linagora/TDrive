import { ChannelType } from 'app/features/channels/types/channel';
import useRouterWorkspace from 'app/features/router/hooks/use-router-workspace';
import { useSearchModal } from 'app/features/search/hooks/use-search';
import ChannelAvatar from 'app/components/search-popup/parts/channel-avatar/channel-avatar';
import { openChannel } from '../common';
import { useChannelNotifications } from 'app/features/users/hooks/use-notifications';
import { useChannel } from 'app/features/channels/hooks/use-channel';
import { Badge } from 'app/atoms/badge';

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
  const { setOpen } = useSearchModal();

  const notifications = useChannelNotifications(channel.id || '');

  return (
    <div
      className="relative"
      onClick={() => {
        openChannel(channel, currentWorkspaceId);
        setOpen(false);
      }}
    >
      <ChannelAvatar channel={channel} showLabel={true} collapseToOne={true} />
      {!!channel.user_member && !!notifications?.badges?.length && (
        <>
          <Badge size="sm" className="rounded-full px-2.5 absolute -right-2 top-0" theme="primary">
            {notifications.badges.length}
          </Badge>
        </>
      )}
    </div>
  );
};
