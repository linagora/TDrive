import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { ChannelType } from 'app/features/channels/types/channel';
import { ReachableChannelsState } from '../state/channels';
import useRouterCompany from 'app/features/router/hooks/use-router-company';
import useRouterWorkspace from 'app/features/router/hooks/use-router-workspace';
import ChannelsReachableAPIClient from 'app/features/channels/api/channels-reachable-api-client';
import { useSetChannel } from './use-channel';

export function useReachableChannels(): {
  reachableChannels: ChannelType[];
  refresh: () => void;
} {
  const companyId = useRouterCompany();
  const workspaceId = useRouterWorkspace();
  const [reachableChannels, _setReachableChannels] = useRecoilState(
    ReachableChannelsState({ companyId, workspaceId }),
  );
  const { set } = useSetChannel();

  const refresh = async () => {
    const channels = await ChannelsReachableAPIClient.get(companyId, workspaceId);

    channels.forEach(channel => {
      set(channel);
    });

    if (channels) _setReachableChannels(channels);
  };

  useEffect(() => {
    companyId.length > 1 && workspaceId.length > 1 && refresh();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, workspaceId]);

  return {
    refresh,
    reachableChannels,
  };
}
