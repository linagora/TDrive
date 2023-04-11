import ChannelMembersAPIClient from 'app/features/channel-members-search/api/members-api-client';
import { useGlobalEffect } from 'app/features/global/hooks/use-global-effect';
import { LoadingState } from 'app/features/global/state/atoms/Loading';
import { delayRequest } from 'app/features/global/utils/managedSearchRequest';
import { matchQuery } from 'app/features/global/utils/strings';
import useRouterChannel from 'app/features/router/hooks/use-router-channel';
import useRouterCompany from 'app/features/router/hooks/use-router-company';
import useRouterWorkspace from 'app/features/router/hooks/use-router-workspace';
import _ from 'lodash';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { SearchChannelMemberInputState } from '../state/search-channel-member';
import { ListChannelMembersStateFamily } from '../state/store';
import { ParamsChannelMember, ChannelMemberWithUser } from '../types/channel-members';

export const useRefreshSearchChannelMembers = (context: ParamsChannelMember) => {
  const searchInput = useRecoilValue(SearchChannelMemberInputState);
  const setLoading = useSetRecoilState(LoadingState('useSearchChannelMembers'));
  const [listChannelMembers, setChannelMembers] = useRecoilState<ChannelMemberWithUser[]>(
    ListChannelMembersStateFamily(context),
  );

  const refresh = async () => {
    setLoading(true);
    const response = await ChannelMembersAPIClient.getMembers(context, searchInput);

    setChannelMembers(_.uniqBy([...listChannelMembers, ...response], 'user_id'));
    setLoading(false);
  };

  return {
    refresh,
    listChannelMembers,
  };
};

export const useSearchChannelMembers = (channelId: string) => {
  const companyId = useRouterCompany();
  const workspaceId = useRouterWorkspace();

  const context: ParamsChannelMember = {
    companyId,
    workspaceId,
    channelId: channelId ? channelId : useRouterChannel(),
  };

  const searchInput = useRecoilValue(SearchChannelMemberInputState);
  const [loading, setLoading] = useRecoilState(LoadingState('useSearchChannelMembers'));
  const { refresh, listChannelMembers } = useRefreshSearchChannelMembers(context);

  useGlobalEffect(
    'useSearchChannelMembers',
    () => {
      (async () => {
        setLoading(true);
        if (searchInput) {
          delayRequest('useSearchChannelMembers', async () => {
            await refresh();
          });
        }
      })();
    },
    [searchInput],
  );

  const listChannelMembersFiltered = listChannelMembers.filter(cm => {
    if (!cm.user) return false;
    return matchQuery(
      searchInput,
      `${cm.user.email} ${cm.user.first_name} ${cm.user.last_name} ${cm.user.username}`,
    );
  });

  return {
    refresh,
    loading,
    listChannelMembers: listChannelMembersFiltered,
  };
};
