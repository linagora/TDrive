import { ChannelType } from 'app/features/channels/types/channel';
import { useDirectChannels, useRefreshDirectChannels } from './use-direct-channels';
import {
  usePublicOrPrivateChannels,
  useRefreshPublicOrPrivateChannels,
} from './use-public-or-private-channels';

export function useRefreshFavoriteChannels(): {
  refresh: () => Promise<void>;
} {
  const { refresh: refreshPublicOrPrivateChannels } = useRefreshPublicOrPrivateChannels();
  const { refresh: refreshDirectChannels } = useRefreshDirectChannels();

  const refresh = async () => {
    await refreshPublicOrPrivateChannels();
    await refreshDirectChannels();
  };

  return { refresh };
}

export function useFavoriteChannels(): {
  favoriteChannels: ChannelType[];
  refresh: () => Promise<void>;
} {
  const { publicChannels, privateChannels } = usePublicOrPrivateChannels();
  const { directChannels } = useDirectChannels();

  const { refresh } = useRefreshFavoriteChannels();

  return {
    favoriteChannels: [...publicChannels, ...privateChannels, ...directChannels].filter(
      c => c.user_member?.favorite,
    ),
    refresh,
  };
}
