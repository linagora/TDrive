import { useRecoilState } from 'recoil';

import { TabType } from 'app/features/tabs/types/tab';
import { useRealtimeRoom } from 'app/features/global/hooks/use-realtime';
import TabsAPIClients from 'app/features/tabs/api/tabs-api-client';
import { AtomTabKey, TabState } from '../state/tabs';
import useRouterChannel from '../../router/hooks/use-router-channel';
import useRouterCompany from 'app/features/router/hooks/use-router-company';
import useRouterWorkspace from 'app/features/router/hooks/use-router-workspace';

export default function useTabsCommons() {
  const companyId = useRouterCompany();
  const workspaceId = useRouterWorkspace();
  const channelId = useRouterChannel();
  const context: AtomTabKey = { companyId, workspaceId, channelId };

  const [tabs, setTabs] = useRecoilState(TabState(context));

  const save = async (tab: TabType) => {
    await TabsAPIClients.save({ companyId, workspaceId, channelId }, tab);
    await refresh();
  };

  const remove = async (tabId: string) => {
    await TabsAPIClients.remove({ companyId, workspaceId, channelId }, tabId);
    await refresh();
  };

  const refresh = async () => {
    const tabsRefreshed = await TabsAPIClients.list({ companyId, workspaceId, channelId });
    if (tabsRefreshed) setTabs(tabsRefreshed);
  };

  return { tabs, save, refresh, remove };
}

export function useTabs() {
  const channelId = useRouterChannel();
  const { tabs, save, refresh, remove } = useTabsCommons();
  useRealtimeRoom<TabType>(TabsAPIClients.websockets(channelId)[0], 'UseTabs', () => refresh());

  return { tabs, save, refresh, remove };
}

export function useTab(tabId: string) {
  const { tabs, remove, save } = useTabs();
  return {
    tab: tabs.find(t => t.id === tabId),
    remove: () => {
      remove(tabId);
    },
    save: save,
  };
}
