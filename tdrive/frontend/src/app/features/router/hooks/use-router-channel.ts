import RouterService from 'app/features/router/services/router-service';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { RouterState } from 'app/features/router/state/atoms/router';
import { RouterChannelSelector } from 'app/features/router/state/selectors/router-selector';

export default function useRouterChannel() {
  const setClientState = useSetRecoilState(RouterState);
  RouterService.setRecoilState = setClientState;
  const channelId = useRecoilValue(RouterChannelSelector);

  return channelId;
}
