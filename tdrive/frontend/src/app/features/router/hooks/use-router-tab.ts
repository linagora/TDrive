import RouterService from 'app/features/router/services/router-service';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { RouterState } from 'app/features/router/state/atoms/router';
import { RouterTabSelector } from 'app/features/router/state/selectors/router-selector';

export default function useRouterTab() {
  const setClientState = useSetRecoilState(RouterState);
  RouterService.setRecoilState = setClientState;
  const channelId = useRecoilValue(RouterTabSelector);

  return channelId;
}
