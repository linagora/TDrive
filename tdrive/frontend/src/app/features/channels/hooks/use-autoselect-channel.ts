/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import useRouterWorkspace from 'app/features/router/hooks/use-router-workspace';
import useRouterChannel from 'app/features/router/hooks/use-router-channel';
import RouterServices from 'app/features/router/services/router-service';
import { useDirectChannels } from './use-direct-channels';
import { usePublicOrPrivateChannels } from './use-public-or-private-channels';
import LocalStorage from 'app/features/global/framework/local-storage-service';

const fromLocalStorage = LocalStorage.getItem('default_channel_id_per_workspace');
const activeChannelPerWorkspace: { [key: string]: string } =
  (typeof fromLocalStorage === 'object' ? (fromLocalStorage as any) : {}) || {};

export function useAutoSelectChannel() {
  const workspaceId = useRouterWorkspace();
  const channelId = useRouterChannel();
  const { directChannels } = useDirectChannels();
  const { publicChannels, privateChannels } = usePublicOrPrivateChannels();
  const channels = [...directChannels, ...publicChannels, ...privateChannels];

  useEffect(() => {
    if (channelId) {
      activeChannelPerWorkspace[workspaceId] = channelId;
      LocalStorage.setItem('default_channel_id_per_workspace', activeChannelPerWorkspace);
    }
  }, [channelId]);

  useEffect(() => {
    if (!channelId && channels.length > 0) {
      let preferedChannelId = activeChannelPerWorkspace[workspaceId];

      if (!preferedChannelId || !channels.find(c => c.id === preferedChannelId)) {
        preferedChannelId =
          channels.sort((a, b) => (b.last_activity || 0) - (a.last_activity || 0))[0]?.id ||
          preferedChannelId;
      }

      if (preferedChannelId) {
        const url = RouterServices.generateRouteFromState({
          channelId: preferedChannelId,
        });
        RouterServices.replace(url);
      }
    }
  }, [workspaceId, channels.length > 0]);
}
