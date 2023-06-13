import { DriveApiClient } from '@features/drive/api-client/api-client';
import { useGlobalEffect } from '@features/global/hooks/use-global-effect';
import { LoadingState } from '@features/global/state/atoms/Loading';
import { delayRequest } from '@features/global/utils/managedSearchRequest';
import useRouterCompany from '@features/router/hooks/use-router-company';
import _ from 'lodash';
import { useRecoilState, useRecoilValue } from 'recoil';
import { RecentDriveItemsState } from '../state/recent-drive-items';
import { SearchDriveItemsResultsState } from '../state/search-drive-items-result';
import { SearchInputState } from '../state/search-input';
import { useSearchModal } from './use-search';

export const useSharedWithMeDriveItemsLoading = () => {
  return useRecoilValue(LoadingState('useSearchDriveItems'));
};

let currentQuery = '';

export const useSharedWithMeDriveItems = () => {
  const companyId = useRouterCompany();
  const searchInput = useRecoilValue(SearchInputState);
  const [loading, setLoading] = useRecoilState(LoadingState('useSearchDriveItems'));

  const [searched, setSearched] = useRecoilState(SearchDriveItemsResultsState(companyId));

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

    const query = searchInput.query;
    currentQuery = query;

    const response = await DriveApiClient.search(searchInput.query, "shared-with-me", opt);
    console.log("response is: ", response);
    const results = response.entities || [];
    console.log("results is: ", results);

    const update = {
      results,
      nextPage: '',
      // nextPage: response.next_page_token,
    };

    if (currentQuery !== query) {
      return;
    }
    setSearched(update);
    setLoading(false);
  };

  const loadMore = async () => {
    //Not implemented
    console.error('Not implemented');
  };

  useGlobalEffect(
    'useSearchDriveItems',
    () => {
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
    [searchInput.channelId, searchInput.workspaceId],
  );

  return { loading, driveItems: searched.results, loadMore, refresh };
};
