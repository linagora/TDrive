import { useRecoilValue, useSetRecoilState } from 'recoil';
import RouterService from 'app/features/router/services/router-service';
import { RouterState } from 'app/features/router/state/atoms/router';
import { RouterWorkspaceSelector } from 'app/features/router/state/selectors/router-selector';

export default function useRouterWorkspace() {
  const setClientState = useSetRecoilState(RouterState);
  RouterService.setRecoilState = setClientState;
  const workspaceId = useRecoilValue(RouterWorkspaceSelector);

  return workspaceId;
}
