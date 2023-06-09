import { useRecoilValue, useSetRecoilState } from 'recoil';
import RouterService from '@features/router/services/router-service';
import { RouterState } from '@features/router/state/atoms/router';
import { RouteViewSelector } from '@features/router/state/selectors/router-selector';

export default function useRouteView() {
  const setClientState = useSetRecoilState(RouterState);
  RouterService.setRecoilState = setClientState;
  const viewId = useRecoilValue(RouteViewSelector);

  return viewId;
}
