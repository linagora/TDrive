import { Button } from '@atoms/button/button';
import {
  ClockIcon,
  CloudIcon,
  ExternalLinkIcon,
  HeartIcon,
  ShareIcon,
  TrashIcon,
  UserIcon,
  UserGroupIcon,
} from '@heroicons/react/outline';
import useRouterCompany from '@features/router/hooks/use-router-company';
import useRouterWorkspace from '@features/router/hooks/use-router-workspace';
import { useCurrentUser } from 'app/features/users/hooks/use-current-user';
import { useRecoilState } from 'recoil';
import { Title } from '../../../atoms/text';
import { useDriveItem } from '../../../features/drive/hooks/use-drive-item';
import { DriveCurrentFolderAtom } from '../body/drive/browser';
import Account from '../common/account';
import AppGrid from '../common/app-grid';
import DiskUsage from '../common/disk-usage';
import Actions from './actions';
import { useHistory, useLocation } from 'react-router-dom';

export default () => {
  const history = useHistory();
  const location = useLocation();
  const company = useRouterCompany();
  const workspace = useRouterWorkspace();
  const [parentId, setParentId] = useRecoilState(
    DriveCurrentFolderAtom({ initialFolderId: 'root' }),
  );
  const { user } = useCurrentUser();
  const active = false;
  const { access: rootAccess } = useDriveItem('root');
  const { inTrash, path } = useDriveItem(parentId);
  const activeClass = 'bg-zinc-50 dark:bg-zinc-800 !text-blue-500';
  let folderType = 'home';
  if ((path || [])[0]?.id === 'user_' + user?.id) folderType = 'personal';
  if (inTrash) folderType = 'trash';
  return (
    <div className="grow flex flex-col overflow-auto -m-4 p-4 relative">
      <div className="grow">
        <div className="sm:hidden block mb-2">
          <div className="flex flex-row space-between w-full">
            <div className="grow">
              <Account sidebar />
            </div>
            <AppGrid />
          </div>

          <div className="mt-6" />
          <Title>Actions</Title>
        </div>

        <Actions />

        <div className="mt-4" />
        <Title>Drive</Title>
        <Button
          onClick={() => setParentId('root')}
          size="lg"
          theme="white"
          className={'w-full mt-2 mb-1 ' + (folderType === 'home' ? activeClass : '')}
        >
          <CloudIcon className="w-5 h-5 mr-4" /> Home
        </Button>
        <Button
          onClick={() => setParentId('user_' + user?.id)}
          size="lg"
          theme="white"
          className={'w-full mb-1 ' + (folderType === 'personal' ? activeClass : '')}
        >
          <UserIcon className="w-5 h-5 mr-4" /> My Drive
        </Button>
        <Button
          onClick={() =>  history.push(`/client/${company}/v/shared-with-me`)}
          size="lg"
          theme="white"
          className={'w-full mb-1 ' + (folderType === 'personal' ? activeClass : '')}
        >
          <UserGroupIcon className="w-5 h-5 mr-4" /> Shared with me
        </Button>
        {false && (
          <>
            <Button
              size="lg"
              theme="white"
              className={'w-full mb-1 ' + (!active ? activeClass : '')}
            >
              <ClockIcon className="w-5 h-5 mr-4" /> Recent
            </Button>
            <Button
              size="lg"
              theme="white"
              className={'w-full mb-1 ' + (!active ? activeClass : '')}
            >
              <HeartIcon className="w-5 h-5 mr-4" /> Favorites
            </Button>
          </>
        )}
        {rootAccess === 'manage' && (
          <Button
            onClick={() => setParentId('trash')}
            size="lg"
            theme="white"
            className={'w-full mb-1 ' + (folderType === 'trash' ? activeClass : '')}
          >
            <TrashIcon className="w-5 h-5 mr-4 text-rose-500" /> Trash
          </Button>
        )}

        {false && (
          <>
            <div className="mt-4" />
            <Title>Shared</Title>
            <Button
              size="lg"
              theme="white"
              className={'w-full mt-2 mb-1 ' + (!inTrash ? activeClass : '')}
            >
              <ShareIcon className="w-5 h-5 mr-4" /> Shared with me
            </Button>
            <Button
              size="lg"
              theme="white"
              className={'w-full mb-1 ' + (inTrash ? activeClass : '')}
            >
              <ExternalLinkIcon className="w-5 h-5 mr-4" /> Shared by me
            </Button>
          </>
        )}
      </div>

      <div className="">
        <DiskUsage />
      </div>
    </div>
  );
};
