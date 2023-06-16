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

    let filter:any = {...sharedFilter};
    if (filter.date) {
      if (filter.date === "today") {
        filter = { ...filter, added_lt: '', added_gt: '' };
      }
      if (filter.date === "last_week") {
        const today = new Date();
        const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        filter = { ...filter, added_lt: lastWeek.toISOString(), added_gt: '' };
      }
      if (filter.date === "last_month") {
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        filter = { ...filter, added_lt: lastMonth.toISOString(), added_gt: '' };
      }
    }

    const response = await DriveApiClient.sharedWithMe(filter, opt);
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
        if (sharedFilter.mimeType) {
          delayRequest('useSearchDriveItems', async () => {
            await refresh();
          });
        } else {
          refresh();
        }
      })();
    },
    [sharedFilter, searchInput.channelId, searchInput.workspaceId],
  );

  return { loading, driveItems: [...items.results], loadMore, refresh };
};
