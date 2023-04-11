import Avatar from 'app/atoms/avatar';
import { Button } from 'app/atoms/button/button';
import { Checkbox } from 'app/atoms/input/input-checkbox';
import { InputLabel } from 'app/atoms/input/input-decoration-label';
import Select from 'app/atoms/input/input-select';
import { Input } from 'app/atoms/input/input-text';
import A from 'app/atoms/link';
import { Modal, ModalContent } from 'app/atoms/modal';
import { usePublicOrPrivateChannels } from 'app/features/channels/hooks/use-public-or-private-channels';
import { ChannelType } from 'app/features/channels/types/channel';
import Languages from 'app/features/global/services/languages-service';
import { getBase64 } from 'app/features/global/utils/strings';
import Block from 'app/molecules/grouped-rows/base';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import Emojione from '../emojione/emojione';

const ChannelGroupSelector = (props: { group: string; onChange: (str: string) => void }) => {
  const clean = (str?: string) => str?.toLocaleLowerCase().trim().replace(/ +/, ' ');

  const [group, setGroup] = useState<string>(clean(props.group) || '');
  const [newGroup, setNewGroup] = useState<string>('');
  const { publicChannels, privateChannels } = usePublicOrPrivateChannels();
  const groups = _.uniq(
    [...publicChannels, ...privateChannels]
      .filter(p => p.channel_group)
      .map(p => clean(p.channel_group) || ''),
  ).sort();

  useEffect(() => {
    if (!groups.includes(group) && !newGroup) setNewGroup(group);
  }, [groups]);

  return (
    <div className="w-screen max-w-sm p-4 -m-4">
      <hr className="my-1 -mx-4 mb-3" />

      {groups.map(g => (
        <Block
          key={g}
          className="my-3"
          avatar={<Avatar nogradient title={g} size="sm" />}
          title={_.capitalize(g)}
          suffix={
            <Checkbox
              onChange={v => {
                setGroup(v ? g : '');
              }}
              value={g === group}
            />
          }
          subtitle={<></>}
        />
      ))}

      <Block
        avatar={<div className="w-7" />}
        title={
          <div className="grow p-1 font-medium">
            <Input
              theme="outline"
              onChange={e => {
                setNewGroup(e.target.value);
                setGroup(clean(e.target.value) || '');
              }}
              value={newGroup}
              className=""
              placeholder={Languages.t('scenes.app.channelsbar.channel_information.group.new')}
            />
          </div>
        }
        suffix={
          <Checkbox
            disabled={!newGroup}
            onChange={v => {
              setGroup(v ? newGroup : '');
            }}
            value={!!group && clean(newGroup) === clean(group)}
          />
        }
        subtitle={<></>}
      />

      <div className="text-center mt-4">
        <Button
          theme={group ? 'primary' : 'outline'}
          className="max-w-xs"
          onClick={() => props.onChange(group)}
        >
          <span className="text-ellipsis overflow-hidden whitespace-nowrap">
            {group
              ? Languages.t('scenes.app.channelsbar.channel_information.group.save', [
                  _.capitalize(clean(group)),
                ])
              : Languages.t('scenes.app.channelsbar.channel_information.group.save_none')}
          </span>
        </Button>
      </div>
    </div>
  );
};

export const ChannelInformationForm = (props: {
  channel?: ChannelType;
  onChange: (change: {
    name: string;
    icon: string;
    description: string;
    channel_group: string;
  }) => void;
}) => {
  const [channelGroupModal, setChannelGroupModal] = useState<string | false>(false);

  const [group, setGroup] = useState<string>(props.channel?.channel_group || '');
  const [name, setName] = useState(props.channel?.name || '');
  const [description, setDescription] = useState(props.channel?.description || '');
  const [icon, setIcon] = useState(props.channel?.icon || '');

  return (
    <div className="w-screen max-w-sm p-4 -m-4">
      <Modal open={channelGroupModal !== false} onClose={() => setChannelGroupModal(false)}>
        <ModalContent title={Languages.t('scenes.app.channelsbar.channel_information.group.title')}>
          <ChannelGroupSelector
            group={channelGroupModal || ''}
            onChange={group => {
              setChannelGroupModal(false);
              setGroup(group);
            }}
          />
        </ModalContent>
      </Modal>

      <div className="text-center my-4">
        <div className="inline-block overflow-hidden m-0 p-0">
          <Avatar
            size="xl"
            nogradient={!!(icon && (icon?.length || 0) < 20)}
            icon={icon && (icon?.length || 0) < 20 ? <Emojione type={icon} /> : false}
            avatar={(icon?.length || 0) > 20 ? icon : ''}
            title={name}
          />
        </div>
        <div className="mt-2">
          {!!icon && (
            <A
              className="!text-rose-500"
              onClick={() => {
                setIcon('');
              }}
            >
              {Languages.t('scenes.app.channelsbar.channel_information.logo.remove')}
            </A>
          )}
          {!icon && (
            <A
              onClick={() => {
                const input = document.createElement('input');
                input.style.position = 'absolute';
                input.style.left = '-10000px';
                input.type = 'file';
                input.accept = 'image/png, image/jpeg, image/gif, image/webp';
                input.multiple = false;
                input.onchange = async () => {
                  if (input.files?.[0]) {
                    const b64 = await getBase64(input.files?.[0]);
                    setIcon(b64);
                  }
                  input.parentElement?.removeChild(input);
                };
                document.body.appendChild(input);
                input.click();
              }}
            >
              {Languages.t('scenes.app.channelsbar.channel_information.logo.add')}
            </A>
          )}
        </div>
      </div>

      <InputLabel
        label={Languages.t('scenes.app.channelsbar.channel_information.name')}
        input={
          <Input
            className="int-channel-name"
            theme="outline"
            placeholder={Languages.t('scenes.app.channelsbar.channel_information.name')}
            value={name}
            onChange={e => setName(e.target.value)}
          />
        }
      />

      <InputLabel
        className="mt-4"
        label={Languages.t('scenes.app.channelsbar.channel_information.description')}
        input={
          <Input
            className="int-channel-description"
            theme="outline"
            placeholder={Languages.t(
              'scenes.app.channelsbar.channel_information.description.placeholder',
            )}
            defaultValue={description}
            onChange={e => setDescription(e.target.value)}
            multiline
          />
        }
      />

      <InputLabel
        className="mt-4"
        label={Languages.t('scenes.app.channelsbar.channel_information.group')}
        input={
          <div
            className="cursor-pointer"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              setChannelGroupModal(group || '');
            }}
          >
            <Select className="pointer-events-none" theme="outline">
              {!group && (
                <option disabled selected>
                  {Languages.t('scenes.app.channelsbar.channel_information.group.none')}
                </option>
              )}
              {group && <option>{_.capitalize(group)}</option>}
            </Select>
          </div>
        }
      />

      <div className="text-center mt-6">
        <Button
          className="int-channel-save-information"
          theme="primary"
          onClick={() => {
            props.onChange({ channel_group: group, name, description, icon });
          }}
          disabled={!name.trim()}
        >
          {Languages.t('scenes.app.channelsbar.channel_information.save')}
        </Button>
      </div>
    </div>
  );
};
