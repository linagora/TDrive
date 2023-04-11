import { usePublicOrPrivateChannels } from 'app/features/channels/hooks/use-public-or-private-channels';
import { ChannelType } from 'app/features/channels/types/channel';
import { uniqBy } from 'lodash';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { invitationChannelListState, invitationChannelSelectionState } from '../state/invitation';

export const useInvitationChannels = () => {
  const [channels, setSelectedChannels] = useRecoilState(invitationChannelListState);
  const [open, setOpen] = useRecoilState(invitationChannelSelectionState);
  const { publicChannels } = usePublicOrPrivateChannels();
  const defaultChannels = (publicChannels || []).filter(({ is_default }) => is_default);

  const setChannels = (channels: ChannelType[]): void => {
    setSelectedChannels(uniqBy([...channels, ...defaultChannels], 'id'));
  };

  useEffect(() => {
    setSelectedChannels(uniqBy([...channels, ...defaultChannels], 'id'));
  }, []);

  return {
    openSelection: () => setOpen(true),
    closeSelection: () => setOpen(false),
    setChannels,
    selectedChannels: channels,
    open,
    reset: () => setSelectedChannels(defaultChannels),
  };
};
