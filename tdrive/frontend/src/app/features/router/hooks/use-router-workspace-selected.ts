import { useRecoilValue } from 'recoil';
import { RouterWorkspaceSelectedSelector } from 'app/features/router/state/selectors/router-selector';

export default function useRouterWorkspaceSelected(workspaceId: string) {
  return useRecoilValue(RouterWorkspaceSelectedSelector(workspaceId));
}
