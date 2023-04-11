import { delayRequest } from 'app/features/global/utils/managedSearchRequest';
import { useRecoilState, useRecoilValue } from 'recoil';
import { SearchInputState } from '../state/search-input';
import { DriveApiClient } from 'app/features/drive/api-client/api-client';
import { LoadingState } from 'app/features/global/state/atoms/Loading';
import { SearchDriveItemsResultsState } from '../state/search-drive-items-result';
import { RecentDriveItemsState } from '../state/recent-drive-items';
import _ from 'lodash';
import { useGlobalEffect } from 'app/features/global/hooks/use-global-effect';
import useRouterCompany from 'app/features/router/hooks/use-router-company';
import { useSearchModal } from './use-search';

export const useSearchDriveItemsLoading = () => {
  return useRecoilValue(LoadingState('useSearchDriveItems'));
};

let currentQuery = '';

export const useSearchDriveItems = () => {
  const companyId = useRouterCompany();
  const { open } = useSearchModal();
  const searchInput = useRecoilValue(SearchInputState);
  const [loading, setLoading] = useRecoilState(LoadingState('useSearchDriveItems'));

  const [searched, setSearched] = useRecoilState(SearchDriveItemsResultsState(companyId));
  const [recent, setRecent] = useRecoilState(RecentDriveItemsState(companyId));

  const opt = _.omitBy(
    {
      limit: 25,
      workspace_id: searchInput.workspaceId,
      company_id: companyId,
      channel_id: searchInput.channelId,
    },
    _.isUndefined,
  );

  const refresh = async () => {
    setLoading(true);
    const isRecent = searchInput.query?.trim()?.length === 0;

    const query = searchInput.query;
    currentQuery = query;

    const response = await DriveApiClient.search(searchInput.query, opt);
    let results = response.entities || [];
    if (isRecent)
      results = results.sort(
        (a, b) => (parseInt(b?.last_modified) || 0) - (parseInt(a.last_modified) || 0),
      );

    const update = {
      results,
      nextPage: '',
      // nextPage: response.next_page_token,
    };

    if (currentQuery !== query) {
      return;
    }

    if (!isRecent) setSearched(update);
    if (isRecent) setRecent(update);
    setLoading(false);
  };

  const loadMore = async () => {
    //Not implemented
    console.error('Not implemented');
  };

  useGlobalEffect(
    'useSearchDriveItems',
    () => {
      if (open)
        (async () => {
          setLoading(true);
          if (searchInput.query) {
            delayRequest('useSearchDriveItems', async () => {
              await refresh();
            });
          } else {
            refresh();
          }
        })();
    },
    [searchInput.query, searchInput.channelId, searchInput.workspaceId, open],
  );

  return { loading, driveItems: searched.results, loadMore, refresh };
};
