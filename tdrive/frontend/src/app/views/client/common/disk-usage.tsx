import { Base, Title } from '@atoms/text';
import { useCurrentUser } from 'app/features/users/hooks/use-current-user';
import { useDriveItem } from '@features/drive/hooks/use-drive-item';
import { formatBytes } from '@features/drive/utils';
import Languages from 'features/global/services/languages-service';

export default () => {
  const { user } = useCurrentUser();
  const { access, item } = useDriveItem('root');
  const { item: drive } = useDriveItem('user_' + user?.id);
  const { item: trash } = useDriveItem('trash');
  return (
    <>
      <div className="bg-zinc-500 dark:bg-zinc-800 bg-opacity-10 rounded-md p-4 w-auto max-w-md">
        <div className="w-full">
          <Title>
            {access == 'manage' ? formatBytes(item?.size || 0) : formatBytes(drive?.size || 0)}
            <Base> {Languages.t('components.disk_usage.used')} </Base>{' '}
            <Base>
              {formatBytes(trash?.size || 0)} {Languages.t('components.disk_usage.in_trash')}
            </Base>
          </Title>
        </div>
      </div>
    </>
  );
};
