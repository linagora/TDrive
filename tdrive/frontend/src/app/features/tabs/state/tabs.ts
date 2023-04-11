import { atomFamily } from 'recoil';

import { TabType } from 'app/features/tabs/types/tab';
import TabsAPIClients from 'app/features/tabs/api/tabs-api-client';

export type AtomTabKey = { companyId: string; workspaceId: string; channelId: string };

export const TabState = atomFamily<TabType[], AtomTabKey>({
  key: 'TabState',
  default: async ({ companyId, workspaceId, channelId }) => {
    return await TabsAPIClients.list({ companyId, workspaceId, channelId });
  },
});
