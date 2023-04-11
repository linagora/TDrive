import { useRecoilValue } from 'recoil';
import { RouterChannelSelectedSelector } from 'app/features/router/state/selectors/router-selector';

export default function useRouterChannelSelected(channelId: string) {
  return useRecoilValue(RouterChannelSelectedSelector(channelId));
}
