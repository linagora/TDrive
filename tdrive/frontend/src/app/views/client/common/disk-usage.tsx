import { Base, Title } from '@atoms/text';
import { useDriveItem } from '@features/drive/hooks/use-drive-item';
import { formatBytes } from '@features/drive/utils';
import Languages from "features/global/services/languages-service";
import { useCurrentUser } from 'app/features/users/hooks/use-current-user';

export default () => {
  const { user } = useCurrentUser();
  const { access, item: rootItem, quota: mainQuota } = useDriveItem('main');
  const { item: myDriveItem, quota: myDriveQuota} = useDriveItem('user_' + user?.id);
  const { item: trash, quota: trashQuota} = useDriveItem('trash');

  const itemSize = (rootItem?.size ?? 0) + (myDriveItem?.size ?? 0);

  return (
    <>
      {access !== 'read' && (
        <div className="bg-zinc-500 dark:bg-zinc-800 bg-opacity-10 rounded-md p-4 w-auto max-w-md">
          <div className="w-full">
            <Title>
              {formatBytes(itemSize || 0)}
              <Base> { Languages.t('components.disk_usage.used', [formatBytes(mainQuota || 0)])} </Base> 
              <Base>{formatBytes(trash?.size || 0)} {Languages.t('components.disk_usage.in_trash', [formatBytes(trashQuota || 0)])}</Base>
            </Title>
          </div>
        </div>
      )}
    </>
  );
};
