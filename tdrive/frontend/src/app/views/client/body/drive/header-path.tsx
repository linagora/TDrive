import { Title } from '@atoms/text';
import { DriveItem } from '@features/drive/types';
import { useEffect, useState } from 'react';
import { PublicIcon } from './components/public-icon';

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
  const pathLength = (path || []).reduce((acc, curr) => acc + curr.name.length, 0);
  return (
    <nav className="overflow-hidden whitespace-nowrap mr-2 pl-px inline-flex">
      {pathLength < 70 ? (
        (path || [])?.map((a, i) => (
          <PathItem
            key={a.id}
            item={a}
            first={i === 0}
            last={i + 1 === path?.length}
            onClick={onClick}
          />
        ))
      ) : (
        <>
          <PathItem
            key={path[path.length - 3]?.id}
            item={{
              ...path[path?.length - 3],
              name: '...',
            }}
            first={true}
            last={false}
            onClick={onClick}
          />
          <PathItem
            key={path[path.length - 2]?.id}
            item={path[path?.length - 2]}
            first={false}
            last={false}
            onClick={onClick}
          />
          <PathItem
            key={path[path.length - 1]?.id}
            item={path[path?.length - 1]}
            first={false}
            last={true}
            onClick={onClick}
          />
        </>
      )}
    </nav>
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
  return (
    <div className="flex items-center">
      <a
        href="#"
        className="text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
        onClick={() => {
          onClick(item?.id || '');
        }}
      >
        <Title>{item?.name || ''}</Title>
      </a>
      {item?.access_info?.public?.level && item?.access_info?.public?.level !== 'none' && (
        <PublicIcon className="h-5 w-5 ml-2" />
      )}
      {!last && (
        <svg
          aria-hidden="true"
          className="w-6 h-6 text-gray-400 mx-1"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          ></path>
        </svg>
      )}
    </div>
  );
};
