import React from 'react';
import Emojione from 'components/emojione/emojione';
import MainViewService from 'app/features/router/services/main-view-service';
import { useChannel } from 'app/features/channels/hooks/use-channel';

type PropsType = {
  // channel id
  id: string;
  // channel name
  name: string;
};

export default (props: PropsType): JSX.Element => {
  const { channel } = useChannel(props.id);

  if (!props.id || !channel) {
    return <span>#{props.name}</span>;
  }

  return (
    <div
      className="channel_twacode"
      onClick={() => {
        MainViewService.select(props.id, {
          app: {
            identity: {
              code: 'messages',
              name: '',
              icon: '',
              description: '',
              website: '',
              categories: [],
              compatibility: [],
            },
          },
          context: { type: 'channel' },
          hasTabs: channel.visibility !== 'direct',
        });
      }}
    >
      <Emojione type={channel.icon || ''} />
      {channel.name}
    </div>
  );
};
