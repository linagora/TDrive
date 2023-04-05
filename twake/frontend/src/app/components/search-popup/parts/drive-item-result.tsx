import * as Text from '@atoms/text';
import FileUploadAPIClient from '@features/files/api/file-upload-api-client';
import { Button } from 'app/atoms/button/button';
import { DownloadIcon } from 'app/atoms/icons-agnostic';
import { ArrowRight } from 'react-feather';
import {
  FileTypeArchiveIcon,
  FileTypeDocumentIcon,
  FileTypePdfIcon,
  FileTypeSlidesIcon,
  FileTypeSpreadsheetIcon,
  FileTypeUnknownIcon,
} from 'app/atoms/icons-colored';
import { formatDate } from 'app/features/global/utils/format-date';
import { formatSize } from 'app/features/global/utils/format-file-size';
import { DriveItem } from 'app/features/drive/types';
import useRouterWorkspace from 'app/features/router/hooks/use-router-workspace';
import { useSearchModal } from 'app/features/search/hooks/use-search';
import { SearchInputState } from 'app/features/search/state/search-input';
import { UserType } from 'app/features/users/types/user';
import { useFileViewerModal } from 'app/features/viewer/hooks/use-viewer';
import Media from 'app/molecules/media';
import Highlighter from 'react-highlight-words';
import { useRecoilValue, useRecoilState } from 'recoil';
import { openDriveItem, onDriveItemDownloadClick } from '../common';
import ResultContext from './result-context';
import { useCompanyApplications } from 'app/features/applications/hooks/use-company-applications';
import { DriveCurrentFolderAtom } from 'app/views/client/body/drive/browser';
import { FolderIcon } from '@heroicons/react/solid';

export default (props: { driveItem: DriveItem & { user?: UserType } }) => {
  const input = useRecoilValue(SearchInputState);
  const currentWorkspaceId = useRouterWorkspace();
  const companyApplications = useCompanyApplications();
  const [_, setParentId] = useRecoilState(DriveCurrentFolderAtom('root'));
  const tdriveDriveApplicationId =
    companyApplications.applications.find(application => {
      return application.identity.code === 'tdrive_drive';
    })?.id || '';
  const file = props.driveItem;
  const name = file?.name;
  const extension = name?.split('.').pop();

  const { setOpen } = useSearchModal();
  const { open: openViewer } = useFileViewerModal();

  return (
    <div
      className="flex items-center p-2 hover:bg-zinc-50 rounded-md cursor-pointer"
      onClick={() => openViewer(file)}
    >
      <FileResultMedia file={file} className="w-16 h-16 mr-3" />
      <div className="grow mr-3 overflow-hidden">
        <Text.Base className="block whitespace-nowrap overflow-hidden text-ellipsis">
          <Highlighter
            highlightClassName="text-blue-500 p-0 bg-blue-50"
            searchWords={input?.query?.split(' ')}
            autoEscape={true}
            textToHighlight={name}
          />
        </Text.Base>
        <Text.Info className="block">
          {extension?.toLocaleUpperCase()} • {formatDate(parseInt(file?.last_modified))} •{' '}
          {formatSize(file?.size)}
        </Text.Info>
        <ResultContext
          user={file.user}
          context={{
            companyId: file?.company_id,
          }}
        />
      </div>
      <div
        className="whitespace-nowrap"
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Button
          theme="outline"
          className="w-9 px-1.5 ml-2 rounded-full border-none"
          onClick={() => onDriveItemDownloadClick(file)}
        >
          <DownloadIcon className="text-blue-500 w-6 h-6" />
        </Button>
      </div>
      <div
        className="whitespace-nowrap"
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Button
          theme="outline"
          className="w-9 px-1.5 ml-2 rounded-full border-none"
          onClick={() => {
            openDriveItem(file, currentWorkspaceId, tdriveDriveApplicationId);
            setParentId(file.parent_id);
            setOpen(false);
          }}
        >
          <ArrowRight className="text-blue-500 w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export const FileResultMedia = (props: {
  className?: string;
  size?: 'md' | 'lg' | 'sm';
  file: DriveItem & { user?: UserType };
}) => {
  const file = props.file;

  const name = file?.last_version_cache?.file_metadata?.name;
  const type = FileUploadAPIClient.mimeToType(file?.last_version_cache?.file_metadata?.mime || '');
  const url = FileUploadAPIClient.getFileThumbnailUrlFromMessageFile(file);
  const extension = name?.split('.').pop();

  let iconClassName = 'absolute left-0 top-0 bottom-0 right-0 m-auto w-8 h-8';
  if (url) iconClassName = 'absolute bottom-1 left-1 w-6 h-6';

  if (file.is_directory) {
    return (
      <div className={'relative flex bg-blue-100 rounded-md ' + (props.className || '')}>
        <FolderIcon className="w-10 h-10 m-auto text-blue-500" />
      </div>
    );
  }

  return (
    <div className={'relative flex bg-zinc-200 rounded-md ' + (props.className || '')}>
      <Media
        size={props.size || 'md'}
        url={url}
        duration={type === 'video' ? extension : undefined}
      />
      {(!['image', 'video'].includes(type) || !url) && (
        <>
          {type === 'archive' ? (
            <FileTypeArchiveIcon className={iconClassName} />
          ) : type === 'pdf' ? (
            <FileTypePdfIcon className={iconClassName} />
          ) : type === 'document' ? (
            <FileTypeDocumentIcon className={iconClassName} />
          ) : type === 'spreadsheet' ? (
            <FileTypeSpreadsheetIcon className={iconClassName} />
          ) : type === 'slides' ? (
            <FileTypeSlidesIcon className={iconClassName} />
          ) : (
            <FileTypeUnknownIcon className={iconClassName} />
          )}
        </>
      )}
    </div>
  );
};
