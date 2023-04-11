import ChannelMembersAPIClient from 'app/features/channel-members-search/api/members-api-client';
import ChannelCurrentMemberAPIClient from 'app/features/channel-members/api/channel-members-api-client';
import { useChannel } from 'app/features/channels/hooks/use-channel';
import {
  useDirectChannels,
} from 'app/features/channels/hooks/use-direct-channels';
import { useFavoriteChannels } from 'app/features/channels/hooks/use-favorite-channels';
import {
  usePublicOrPrivateChannels,
  useRefreshPublicOrPrivateChannels,
} from 'app/features/channels/hooks/use-public-or-private-channels';
import useRouterChannel from 'app/features/router/hooks/use-router-channel';
import useRouterCompany from 'app/features/router/hooks/use-router-company';
import useRouterWorkspace from 'app/features/router/hooks/use-router-workspace';
import { useCurrentUser } from 'app/features/users/hooks/use-current-user';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { ChannelMemberSelector } from '../state/store';
import { ChannelMemberType, ParamsChannelMember } from '../types/channel-members';
import { useRefreshChannelMembers } from './members-hook';

export function useChannelMemberCurrentUser(channelId: string) {
  const { favoriteChannels, refresh: refreshAllChannels } = useFavoriteChannels();
  const { directChannels } = useDirectChannels();
  const { publicChannels, privateChannels } = usePublicOrPrivateChannels();
  const { channel } = useChannel(channelId);
  const { user } = useCurrentUser();
  const member = [...publicChannels, ...privateChannels, ...directChannels].find(
    c => c.id === channelId,
  )?.user_member;
  return {
    member,
    favorite: favoriteChannels?.find(favoriteChannel => favoriteChannel.id === channel?.id),
    setFavorite: async (favorite: boolean) => {
      await ChannelCurrentMemberAPIClient.updateChannelMemberPreferences(
        member as ChannelMemberType,
        { favorite },
        {
          companyId: channel.company_id || '',
          workspaceId: channel.workspace_id || '',
          channelId: channel.id || '',
          userId: user?.id || '',
        },
      );
      await refreshAllChannels();
    },
    setNotificationPreference: async (preference: 'all' | 'none' | 'mentions' | 'me') => {
      if (channel.company_id && channel.workspace_id && channel.id && user?.id) {
        await ChannelCurrentMemberAPIClient.updateChannelMemberPreferences(
          member as ChannelMemberType,
          { notification_level: preference },
          {
            companyId: channel.company_id,
            workspaceId: channel.workspace_id,
            channelId: channel.id,
            userId: user?.id,
          },
        );
        await refreshAllChannels();
      }
    },
  };
}

export function useChannelMember(userId: string, params?: ParamsChannelMember) {
  const channelId = params?.channelId ? params.channelId : useRouterChannel();
  const workspaceId = params?.workspaceId ? params.workspaceId : useRouterWorkspace();
  const companyId = params?.companyId ? params.companyId : useRouterCompany();
  const parameters = { companyId, workspaceId, channelId };

  const member = useRecoilValue(ChannelMemberSelector({ channelId, userId }));
  const { refresh } = useRefreshChannelMembers(parameters);
  const { refresh: refreshChannelsBar } = useRefreshPublicOrPrivateChannels();
  const [loading, setLoading] = useState<boolean>(false);

  const leave = async (userId: string) => {
    setLoading(true);

    await ChannelMembersAPIClient.deleteMember(userId, {
      companyId,
      workspaceId,
      channelId,
    });
    refresh();
    refreshChannelsBar();
    setLoading(false);
  };

  const addMember = async (userId: string) => {
    setLoading(true);

    await ChannelMembersAPIClient.addMember(
      { user_id: userId },
      {
        companyId,
        workspaceId,
        channelId,
      },
    );
    setLoading(false);
    refresh();
  };

  return {
    member,
    refresh,
    leave,
    addMember,
    loading,
  };
}
