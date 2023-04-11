/* eslint-disable @typescript-eslint/no-explicit-any */
import ChannelAPIClient from 'app/features/channels/api/channel-api-client';
import { getAllChannelsCache } from 'app/features/channels/hooks/use-channel';
import { ChannelType, createDirectChannelFromUsers } from 'app/features/channels/types/channel';
import { useGlobalEffect } from 'app/features/global/hooks/use-global-effect';
import { LoadingState } from 'app/features/global/state/atoms/Loading';
import { delayRequest } from 'app/features/global/utils/managedSearchRequest';
import Strings, { distanceFromQuery } from 'app/features/global/utils/strings';
import useRouterCompany from 'app/features/router/hooks/use-router-company';
import UserAPIClient from 'app/features/users/api/user-api-client';
import { useCurrentUser } from 'app/features/users/hooks/use-current-user';
import _ from 'lodash';
import { useRecoilState, useRecoilValue } from 'recoil';
import { RecentChannelsState } from '../state/recent-channels';
import { SearchChannelsResultsState } from '../state/search-channels-result';
import { SearchInputState } from '../state/search-input';

export const useSearchChannelsLoading = () => {
  return useRecoilValue(LoadingState('useSearchChannels'));
};

let currentQuery = '';

const frontendSearch = (companyId: string, query: string) => {
  const result = getAllChannelsCache()
    .filter(c => c.company_id === companyId)
    .filter(({ name }) =>
      query
        .split(' ')
        .every(
          word =>
            Strings.removeAccents(`${name}`)
              .toLocaleLowerCase()
              .indexOf(Strings.removeAccents(word).toLocaleLowerCase()) > -1,
        ),
    )
    .sort(
      (a, b) =>
        distanceFromQuery([a.name].join(' '), query) - distanceFromQuery([b.name].join(' '), query),
    );

  return result as ChannelType[];
};

export const useSearchChannels = () => {
  const companyId = useRouterCompany();
  const { user: currentUser } = useCurrentUser();

  const searchInput = useRecoilValue(SearchInputState);
  const [loading, setLoading] = useRecoilState(LoadingState('useSearchChannels'));

  const [searched, setSearched] = useRecoilState(SearchChannelsResultsState(companyId));
  const [recent, setRecent] = useRecoilState(RecentChannelsState(companyId));

  const opt = { limit: 25, company_id: companyId };

  const refresh = async () => {
    setLoading(true);
    const isRecent = searchInput.query?.trim()?.length === 0;

    const query = searchInput.query;
    currentQuery = query;

    const response = await ChannelAPIClient.search(searchInput.query || null, opt);
    let results = (response.resources || []).sort(
      (a, b) =>
        (b.last_activity || 0) / 100 +
        (b.user_member?.last_access || 0) -
        ((a.last_activity || 0) / 100 + (a.user_member?.last_access || 0)),
    );

    if (!isRecent) {
      const users = await UserAPIClient.search<any>(searchInput.query, {
        scope: 'company',
        companyId,
      });
      results = [
        ...results,
        ...(users || []).map(user => createDirectChannelFromUsers(companyId, [currentUser, user])),
      ];
    }

    const update = {
      results,
      nextPage: null,
    };

    if (currentQuery !== query) {
      return;
    }

    if (!isRecent)
      setSearched({
        results: [...frontendSearch(companyId, query), ...update.results].sort(
          (a, b) =>
            distanceFromQuery([a.name].join(' '), query) -
            distanceFromQuery([b.name].join(' '), query),
        ),
        nextPage: update.nextPage,
      });
    if (isRecent) setRecent(update);
    setLoading(false);
  };

  const loadMore = async () => {
    //Not implemented
    console.error('Not implemented');
  };

  useGlobalEffect(
    'useSearchChannels',
    () => {
      (async () => {
        setLoading(true);
        if (searchInput.query) {
          setSearched({ results: frontendSearch(companyId, searchInput.query), nextPage: '' });
          delayRequest('useSearchChannels', async () => {
            await refresh();
          });
        } else {
          refresh();
        }
      })();
    },
    [searchInput.query],
  );

  const channels = _.uniqBy(searchInput?.query ? searched.results : recent.results, a =>
    a.visibility === 'direct' ? (a.members || []).slice().sort()?.join('+') : a.id,
  );

  return {
    loading,
    channels,
    loadMore,
    refresh,
  };
};
