import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';

import { ChannelType } from 'app/features/channels/types/channel';
import { ChannelsState, ChannelSelector } from '../state/channels';
import ChannelAPIClient from '../api/channel-api-client';
import { useGlobalEffect } from 'app/features/global/hooks/use-global-effect';
import useRouterCompany from 'app/features/router/hooks/use-router-company';
import useRouterWorkspace from 'app/features/router/hooks/use-router-workspace';
import { LoadingState } from 'app/features/global/state/atoms/Loading';

//Keep the channels in a easy to use variable
let channelsKeeper: ChannelType[] = [];

export function useChannel(
  channelId: string,
  options?: { companyId: string; workspaceId: string },
) {
  const companyId = options?.companyId || useRouterCompany();
  const workspaceId = options?.workspaceId || useRouterWorkspace();

  const hookId = 'useChannel-' + companyId + '-' + workspaceId + '-' + channelId;
  const [loading, setLoading] = useRecoilState(LoadingState(hookId));

  const channel = useRecoilValue(ChannelSelector(channelId)) as ChannelType;
  const { set } = useSetChannel();

  const save = async (channel: ChannelType) => {
    setLoading(true);
    await ChannelAPIClient.save(channel, {
      companyId: channel.company_id || '',
      workspaceId: channel.workspace_id || '',
      channelId: channel.id,
    });
    set(channel);
    setLoading(false);
  };

  const refresh = async () => {
    setLoading(true);
    const ch = await ChannelAPIClient.get(companyId, workspaceId, channelId);
    if (ch && ch?.id) {
      set(ch);
    } else {
      set({
        id: channelId,
        name: '',
        visibility: 'private',
      });
    }
    setLoading(false);
  };

  useGlobalEffect(
    hookId,
    async () => {
      if (!channel) refresh();
    },
    [],
  );

  return { channel, save, loading, refresh };
}

export const useIsChannelMember = (channelId: string) => {
  return !!useChannel(channelId)?.channel?.user_member?.user_id;
};

export const useIsReadOnlyChannel = (channelId: string) => {
  return useChannel(channelId)?.channel?.is_readonly;
};

export function getChannel(channelId: string) {
  return channelsKeeper.find(ch => ch.id === channelId);
}

export function getAllChannelsCache() {
  return channelsKeeper;
}

export function useSetChannel() {
  const set = useRecoilCallback(({ set }) => (channel: ChannelType) => {
    if (channel.id) {
      channelsKeeper = channelsKeeper.filter(c => c.id !== channel.id);
      channelsKeeper.push(channel);
      set(ChannelsState, channelsKeeper);
    }
  });
  return { set };
}
