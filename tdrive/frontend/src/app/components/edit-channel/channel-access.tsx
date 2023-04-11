/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from 'app/atoms/button/button';
import { BaseSmall } from 'app/atoms/text';
import Switch from 'app/components/inputs/switch';
import { ChannelType } from 'app/features/channels/types/channel';
import Languages from 'app/features/global/services/languages-service';
import Block from 'app/molecules/grouped-rows/base';
import { useState } from 'react';

export const ChannelAccessForm = (props: {
  channel?: ChannelType;
  onChange: (change: {
    visibility: 'private' | 'public';
    is_default: boolean;
    is_readonly: boolean;
  }) => void;
}) => {
  const [visibility, setVisibility] = useState<'private' | 'public'>(
    props.channel?.visibility || ('private' as any),
  );
  const [isDefault, setIsDefault] = useState(props.channel?.is_default || false);
  const [isReadOnly, setIsReadOnly] = useState(props.channel?.is_readonly || false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="w-screen max-w-sm p-4 -m-4">
      <Block
        className="my-4"
        avatar={<></>}
        title={Languages.t('scenes.app.channelsbar.channel_access.visibility')}
        subtitle={
          <BaseSmall className="whitespace-normal leading-3">
            {Languages.t('scenes.app.channelsbar.channel_access.visibility.info')}
          </BaseSmall>
        }
        suffix={
          <Switch
            checked={visibility === 'public'}
            onChange={() => {
              if (visibility === 'public') setIsDefault(false);
              setVisibility(visibility === 'public' ? 'private' : 'public');
            }}
          />
        }
      />

      <Block
        className="my-4"
        avatar={<></>}
        title={Languages.t('scenes.app.channelsbar.channel_access.default')}
        subtitle={
          <BaseSmall className="whitespace-normal leading-3">
            {Languages.t('scenes.app.channelsbar.channel_access.default.info')}
          </BaseSmall>
        }
        suffix={
          <Switch
            checked={isDefault}
            onChange={() => {
              setIsDefault(!isDefault);
              if (visibility === 'private' && !isDefault) setVisibility('public');
            }}
          />
        }
      />

      <Block
        className="my-4"
        avatar={<></>}
        title={Languages.t('scenes.app.channelsbar.channel_access.readonly')}
        subtitle={
          <BaseSmall className="whitespace-normal leading-3">
            {Languages.t('scenes.app.channelsbar.channel_access.readonly.info')}
          </BaseSmall>
        }
        suffix={
          <Switch
            checked={isReadOnly}
            onChange={() => {
              setIsReadOnly(!isReadOnly);
            }}
          />
        }
      />

      <div className="text-center mt-4">
        <Button
          theme="primary"
          loading={loading}
          onClick={() => {
            setLoading(true);
            props.onChange({ visibility, is_default: isDefault, is_readonly: isReadOnly });
            setLoading(false);
          }}
        >
          {Languages.t('scenes.app.channelsbar.channel_access.save')}
        </Button>
      </div>
    </div>
  );
};
