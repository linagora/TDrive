import { Button } from '@atoms/button/button';
import { Title } from '@atoms/text';
import { DriveItem } from '@features/drive/types';
import { ChevronDownIcon } from '@heroicons/react/solid';
import { useEffect, useState } from 'react';
import { PublicIcon } from './components/public-icon';
import MenusManager from '@components/menus/menus-manager.jsx';
import { useCurrentUser } from 'app/features/users/hooks/use-current-user';

export default ({
  path: livePath,
  inTrash,
  setParentId,
}: {
  path: DriveItem[];
  inTrash?: boolean;
  setParentId: (id: string) => void;
}) => {
  const [savedPath, setSavedPath] = useState<DriveItem[]>([]);
  useEffect(() => {
    if (livePath) setSavedPath(livePath);
  }, [livePath]);
  const path = livePath || savedPath;

  return <PathRender inTrash={inTrash || false} path={path} onClick={id => setParentId(id)} />;
};

export const PathRender = ({
  path,
  onClick,
}: {
  path: DriveItem[];
  inTrash: boolean;
  onClick: (id: string) => void;
}) => {
  return (
    <Title className="overflow-hidden whitespace-nowrap mr-2 pl-px inline-flex">
      {(path || [])?.map((a, i) => (
        <PathItem
          key={a.id}
          item={a}
          first={i === 0}
          last={i + 1 === path?.length}
          onClick={onClick}
        />
      ))}
    </Title>
  );
};

const PathItem = ({
  item,
  first,
  last,
  onClick,
}: {
  item: Partial<DriveItem>;
  last?: boolean;
  first?: boolean;
  onClick: (id: string) => void;
}) => {
  const { user } = useCurrentUser();
  return (
    <Button
      theme={last ? 'primary' : 'default'}
      className={
        '-ml-px shrink overflow-hidden whitespace-nowrap last:flex-[1_0_auto_!important] first:flex-[0_0_auto] first:flex-shrink-0 ' +
        (!first ? 'rounded-l-none ' : '') +
        (!last ? 'rounded-r-none ' : '') +
        (!first && !last ? 'max-w-[15ch] ' : '')
      }
      onClick={evt => {
        if (first && user?.id) {
          MenusManager.openMenu(
            [
              { type: 'menu', text: 'Home', onClick: () => onClick('root') },
              { type: 'menu', text: 'My Drive', onClick: () => onClick('user_' + user?.id) },
            ],
            { x: evt.clientX, y: evt.clientY },
            'center',
          );
        } else {
          onClick(item?.id || '');
        }
      }}
    >
      <span className="text-ellipsis overflow-hidden whitespace-nowrap" style={{ maxWidth: 120 }}>
        {item?.name || ''}
      </span>
      {item?.access_info?.public?.level && item?.access_info?.public?.level !== 'none' && (
        <PublicIcon className="h-5 w-5 ml-2" />
      )}
      {first && !!user?.id && (
        <span className="ml-2 -mr-1">
          <ChevronDownIcon className="w-4 h-4" />
        </span>
      )}
    </Button>
  );
};
