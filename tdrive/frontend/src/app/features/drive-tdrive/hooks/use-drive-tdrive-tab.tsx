import useRouterCompany from 'app/features/router/hooks/use-router-company';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { DriveTdriveApiClient } from '../api-client/api-client';
import { DriveTdriveTabAtom } from '../state/store';

export const useDriveTdriveTab = (channelId: string, tabId: string) => {
  const companyId = useRouterCompany();
  const [tab, setTab] = useRecoilState(DriveTdriveTabAtom(tabId));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    DriveTdriveApiClient.getTab(companyId, tabId)
      .then(setTab)
      .finally(() => setLoading(false));
  }, [companyId, tabId]);

  return {
    tab,
    setTab: async (itemId: string, level: 'read' | 'write') => {
      setLoading(true);
      const tab = await DriveTdriveApiClient.setTab(companyId, tabId, channelId, itemId, level);
      if (tab.item_id) setTab(tab);
      setLoading(false);
    },
    loading,
  };
};
