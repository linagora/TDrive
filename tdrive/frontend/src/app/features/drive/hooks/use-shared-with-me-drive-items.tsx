import { DriveApiClient } from '@features/drive/api-client/api-client';
import { useGlobalEffect } from '@features/global/hooks/use-global-effect';
import { LoadingState } from '@features/global/state/atoms/Loading';
import { delayRequest } from '@features/global/utils/managedSearchRequest';
import useRouterCompany from '@features/router/hooks/use-router-company';
import _ from 'lodash';
import { useRecoilState, useRecoilValue } from 'recoil';
import { SharedWithMeDriveItemsResultsState } from '../state/shared-with-me-drive-items-result';
import { SearchInputState } from '../../search/state/search-input';
import { SharedWithMeFilterState } from '../state/shared-with-me-filter';

export const useSharedWithMeDriveItemsLoading = () => {
  return useRecoilValue(LoadingState('useSearchDriveItems'));
};

export const useSharedWithMeDriveItems = () => {
  const companyId = useRouterCompany();
  const searchInput = useRecoilValue(SearchInputState);
  const sharedFilter = useRecoilValue(SharedWithMeFilterState);
  const [loading, setLoading] = useRecoilState(LoadingState('useSearchDriveItems'));

  const [items, setItems] = useRecoilState(SharedWithMeDriveItemsResultsState(companyId));

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

    const filter = sharedFilter;

    const response = await DriveApiClient.sharedWithMe(filter, opt);
    console.log('response is: ', response);
    const results = response.entities || [];

    const update = {
      results,
      nextPage: '',
      // nextPage: response.next_page_token,
    };

    setItems(update);
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

  return { loading, driveItems: [...items.results], loadMore, refresh };
};
