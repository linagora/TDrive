import { SearchIcon } from '@heroicons/react/outline';
import Avatar from 'app/atoms/avatar';
import { InputDecorationIcon } from 'app/atoms/input/input-decoration-icon';
import { Input } from 'app/atoms/input/input-text';
import { Loader } from 'app/atoms/loader';
import { Modal, ModalContent } from 'app/atoms/modal';
import { Base, Info } from 'app/atoms/text';
import {
  useSearchChannels,
  useSearchChannelsLoading,
} from 'app/features/search/hooks/use-search-channels';
import { SearchInputState } from 'app/features/search/state/search-input';
import Block from 'app/molecules/grouped-rows/base';
import { useEffect, useState } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { atom, useRecoilState, useSetRecoilState } from 'recoil';
import Button from '../buttons/button';
import Emojione from '../emojione/emojione';
import UsersService from 'app/features/users/services/current-user-service';
import { ChannelType } from 'app/features/channels/types/channel';
import { Checkbox } from 'app/atoms/input/input-checkbox';
import Languages from '../../features/global/services/languages-service';
import Icon from '../icon/icon';

export const SelectChannelModalAtom = atom<boolean>({
  key: 'SelectChannelModalAtom',
  default: false,
});

export const ChannelSelectorModal = (props: {
  initialChannels: ChannelType[];
  onChange: (channels: ChannelType[]) => void;
  lockDefaultChannels?: boolean;
}) => {
  const [open, setOpen] = useRecoilState(SelectChannelModalAtom);
  const [channels, setChannels] = useState<ChannelType[]>([]);

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <ModalContent title={Languages.t('components.channelselector.title')}>
        <ChannelSelector
          initialChannels={props.initialChannels}
          onChange={channels => {
            setChannels(channels);
          }}
          lockDefaultChannels={props.lockDefaultChannels}
        />
        <Button
          className="w-full mt-2 text-center justify-center"
          disabled={channels.length === 0}
          onClick={() => {
            props.onChange(channels);
          }}
        >
          {Languages.t('components.channelselector.confirm')}
        </Button>
      </ModalContent>
    </Modal>
  );
};

export const ChannelSelector = (props: {
  initialChannels: ChannelType[];
  onChange: (channels: ChannelType[]) => void;
  lockDefaultChannels?: boolean;
}) => {
  const [selectedChannels, setSelectedChannels] = useState<ChannelType[]>(props.initialChannels);
  const setSearch = useSetRecoilState(SearchInputState);
  const { channels } = useSearchChannels();
  const loading = useSearchChannelsLoading();

  const displayedChannels = props.lockDefaultChannels
    ? [
        ...channels.filter(channel => channel.is_default),
        ...channels.filter(channel => !channel.is_default),
      ]
    : channels;

  useEffect(() => {
    props.onChange(selectedChannels);
  }, [selectedChannels]);

  return (
    <>
      <InputDecorationIcon
        prefix={
          loading
            ? ({ className }) => (
                <div className={className + ' !h-6'}>
                  <Loader className="h-4 w-4" />
                </div>
              )
            : SearchIcon
        }
        input={({ className }) => (
          <Input
            className={className}
            placeholder={Languages.t('components.channelselector.search')}
            onChange={e => setSearch({ query: e.target.value })}
          />
        )}
      />

      <PerfectScrollbar
        className="border-b border-zinc-200 py-3 overflow-hidden"
        style={{ maxHeight: '40vh', minHeight: '40vh' }}
        options={{ suppressScrollX: true, suppressScrollY: false }}
        component="div"
      >
        {displayedChannels.map(channel => {
          const name =
            channel.name || channel.users?.map(u => UsersService.getFullName(u)).join(', ');

          return (
            <Block
              key={channel.id}
              avatar={
                <Avatar
                  icon={
                    channel.visibility === 'direct' ? undefined : (
                      <div className="w-full h-full flex justify-center items-center">
                        <Emojione type={channel.icon || ''} />
                      </div>
                    )
                  }
                  title={name || ''}
                />
              }
              title={<Base className="capitalize">{name}</Base>}
              subtitle={
                <Info className="-mt-2">{`${
                  channel.stats?.members || channel.members?.length || 0
                } members`}</Info>
              }
              suffix={
                <div className="flex text-center pr-4">
                  {props.lockDefaultChannels &&
                  props.initialChannels.find(({ id }) => channel.id === id) &&
                  channel.is_default ? (
                    <div className="font-medium h-6 flex items-center justify-center text-sm rounded-full text-white bg-blue-500">
                      <Icon type="lock-alt" className="m-icon-small" />
                    </div>
                  ) : (
                    <Checkbox
                      value={!!selectedChannels.find(({ id }) => channel.id === id)}
                      onChange={() => {
                        if (selectedChannels.includes(channel)) {
                          setSelectedChannels(selectedChannels.filter(c => c.id !== channel.id));
                        } else if (channel.id) {
                          setSelectedChannels([...selectedChannels, channel]);
                        }
                      }}
                    />
                  )}
                </div>
              }
              className="py-2"
            />
          );
        })}
      </PerfectScrollbar>
    </>
  );
};
