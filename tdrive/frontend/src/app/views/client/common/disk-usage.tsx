import { Base, Title } from '@atoms/text';
import { useDriveItem } from '@features/drive/hooks/use-drive-item';
import { formatBytes } from '@features/drive/utils';

export default () => {
  const { access, item } = useDriveItem('root');
  const { item: trash } = useDriveItem('trash');
  return (
    <>
      {access !== 'read' && item?.id === 'root' && (
        <div className="bg-zinc-500 dark:bg-zinc-800 bg-opacity-10 rounded-md p-4 w-auto max-w-md">
          <div className="w-full">
            <Title>
              {formatBytes(item?.size || 0)}
              <Base> used, </Base> <Base>{formatBytes(trash?.size || 0)} in trash</Base>
            </Title>
          </div>
        </div>
      )}
    </>
  );
};
