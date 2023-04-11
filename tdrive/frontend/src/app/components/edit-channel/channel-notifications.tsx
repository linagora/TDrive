/* eslint-disable @typescript-eslint/no-explicit-any */
import { Checkbox } from 'app/atoms/input/input-checkbox';
import { useChannelMemberCurrentUser } from 'app/features/channel-members-search/hooks/member-hook';
import { ChannelType } from 'app/features/channels/types/channel';
import Languages from 'app/features/global/services/languages-service';
import { ToasterService } from 'app/features/global/services/toaster-service';
import Block from 'app/molecules/grouped-rows/base';
import { useState } from 'react';

export const ChannelNotificationsForm = (props: { channel?: ChannelType; onBack: () => void }) => {
  const { member, setNotificationPreference } = useChannelMemberCurrentUser(
    props.channel?.id || '',
  );
  const [value, _setValue] = useState(member?.notification_level || 'all');

  const setValue = (value: any) => {
    _setValue(value);
    setNotificationPreference(value).finally(() => ToasterService.success('Updated'));
    props.onBack();
  };

  return (
    <div className="w-screen max-w-sm p-4 -m-4">
      <Block
        className="my-4"
        avatar={<></>}
        title={Languages.t('scenes.apps.messages.left_bar.stream.notifications.all')}
        subtitle={<></>}
        suffix={
          <Checkbox
            value={value === 'all'}
            onChange={() => {
              setValue('all');
            }}
          />
        }
      />

      <Block
        className="my-4"
        avatar={<></>}
        title={Languages.t('scenes.apps.messages.left_bar.stream.notifications.mentions', [
          '@all',
          '@here',
          `@[you]`,
        ])}
        subtitle={<></>}
        suffix={
          <Checkbox
            value={value === 'mentions'}
            onChange={() => {
              setValue('mentions');
            }}
          />
        }
      />

      <Block
        className="my-4"
        avatar={<></>}
        title={Languages.t('scenes.apps.messages.left_bar.stream.notifications.me', [`@[you]`])}
        subtitle={<></>}
        suffix={
          <Checkbox
            value={value === 'me'}
            onChange={() => {
              setValue('me');
            }}
          />
        }
      />

      <Block
        className="my-4"
        avatar={<></>}
        title={Languages.t('scenes.apps.messages.left_bar.stream.notifications.never')}
        subtitle={<></>}
        suffix={
          <Checkbox
            value={value === 'none'}
            onChange={() => {
              setValue('none');
            }}
          />
        }
      />
    </div>
  );
};
