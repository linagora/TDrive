import { useRecoilValue } from 'recoil';
import { LoadingState } from 'app/features/global/state/atoms/Loading';

export const useChannelsBarLoader = ({
  companyId,
  workspaceId,
}: {
  companyId: string;
  workspaceId: string;
}) => {
  const publicOrPrivateContext = useRecoilValue(
    LoadingState(`channels-${companyId}-${workspaceId}`),
  );
  const applicationContext = useRecoilValue(LoadingState(`applications-${companyId}`));
  const directContext = useRecoilValue(LoadingState(`channels-direct-${companyId}`));

  return { loading: publicOrPrivateContext || applicationContext || directContext };
};
