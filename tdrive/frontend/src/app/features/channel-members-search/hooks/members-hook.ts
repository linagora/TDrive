import ChannelMembersApiClient from 'app/features/channel-members-search/api/members-api-client';
import { useGlobalEffect } from 'app/features/global/hooks/use-global-effect';
import { useRecoilState } from 'recoil';
import { ChannelMemberWithUser, ParamsChannelMember } from '../types/channel-members';
import { ListChannelMembersStateFamily } from '../state/store';
import { LoadingState } from 'app/features/global/state/atoms/Loading';
import useRouterCompany from 'app/features/router/hooks/use-router-company';
import useRouterChannel from 'app/features/router/hooks/use-router-channel';
import useRouterWorkspace from 'app/features/router/hooks/use-router-workspace';

export const useRefreshChannelMembers = (parameters: ParamsChannelMember) => {
  const [members, setMembers] = useRecoilState(ListChannelMembersStateFamily(parameters));
  const [loading, setLoading] = useRecoilState(LoadingState('useChannelMembers'));

  const refresh = async () => {
    setLoading(true);
    const listMembers = await ChannelMembersApiClient.getMembers(parameters);

    if (listMembers) {
      setMembers(listMembers);
    }
    setLoading(false);
  };

  return {
    channelMembers: members,
    loading,
    refresh,
  };
};

export function useChannelMembers(params?: ParamsChannelMember): {
  channelMembers: ChannelMemberWithUser[];
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const companyId = params?.companyId ? params.companyId : useRouterCompany();
  const workspaceId = params?.workspaceId ? params.workspaceId : useRouterWorkspace();
  const channelId = params?.channelId ? params.channelId : useRouterChannel();

  const parameters = { companyId, workspaceId, channelId };

  const { refresh, channelMembers, loading } = useRefreshChannelMembers(parameters);

  //Will be called once only
  useGlobalEffect(
    'useChannelMembers',
    () => {
      refresh();
    },
    [],
  );

  return {
    channelMembers,
    loading,
    refresh,
  };
}
