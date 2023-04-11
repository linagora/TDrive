import { DotsHorizontalIcon } from '@heroicons/react/outline';
import { Button } from 'app/atoms/button/button';
import {
  FileTypeArchiveIcon,
  FileTypeDocumentIcon,
  FileTypeLinkIcon,
  FileTypeMediaIcon,
  FileTypePdfIcon,
  FileTypeSlidesIcon,
  FileTypeSpreadsheetIcon,
  FileTypeUnknownIcon,
} from 'app/atoms/icons-colored';
import { Base, BaseSmall } from 'app/atoms/text';
import Menu from 'app/components/menus/menu';
import { useDrivePreview } from 'app/features/drive/hooks/use-drive-preview';
import { formatBytes } from 'app/features/drive/utils';
import fileUploadApiClient from 'app/features/files/api/file-upload-api-client';
import { useState } from 'react';
import Avatar from '../../../../../atoms/avatar';
import { PublicIcon } from '../components/public-icon';
import { CheckableIcon, DriveItemProps } from './common';

export const DocumentRow = ({
  item,
  className,
  onCheck,
  checked,
  onClick,
  onBuildContextMenu,
}: DriveItemProps) => {
  const [hover, setHover] = useState(false);
  const { open } = useDrivePreview();

  const fileType = fileUploadApiClient.mimeToType(
    item?.last_version_cache?.file_metadata?.mime || '',
  );

  const metadata = item.last_version_cache?.file_metadata || {};
  const hasThumbnails = !!metadata.thumbnails?.length || false;

  const preview = () => {
    open(item);
  };

  return (
    <div
      className={
        'flex flex-row items-center border border-zinc-200 dark:border-zinc-800 -mt-px px-4 py-3 cursor-pointer ' +
        (checked
          ? 'bg-blue-500 bg-opacity-10 hover:bg-opacity-25  '
          : 'hover:bg-zinc-500 hover:bg-opacity-10 ') +
        (className || '')
      }
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={e => {
        if (e.shiftKey || e.ctrlKey) onCheck(!checked);
        else if (onClick) onClick();
        else preview();
      }}
    >
      <div
        onClick={e => {
          e.stopPropagation();
        }}
      >
        <CheckableIcon
          className="mr-2 -ml-1"
          show={hover || checked}
          checked={checked}
          onCheck={onCheck}
          fallback={
            <>
              {hasThumbnails ? (
                <Avatar
                  avatar={metadata.thumbnails?.[0]?.url}
                  size="xs"
                  type="square"
                  title={metadata.name}
                />
              ) : fileType === 'image' || fileType === 'video' ? (
                <FileTypeMediaIcon className={'h-5 w-5 shrink-0 text-gray-400'} />
              ) : fileType === 'archive' ? (
                <FileTypeArchiveIcon className={'h-5 w-5 shrink-0 text-gray-400'} />
              ) : fileType === 'pdf' ? (
                <FileTypePdfIcon className={'h-5 w-5 shrink-0 text-gray-400'} />
              ) : fileType === 'document' ? (
                <FileTypeDocumentIcon className={'h-5 w-5 shrink-0 text-gray-400'} />
              ) : fileType === 'spreadsheet' ? (
                <FileTypeSpreadsheetIcon className={'h-5 w-5 shrink-0 text-gray-400'} />
              ) : fileType === 'slides' ? (
                <FileTypeSlidesIcon className={'h-5 w-5 shrink-0 text-gray-400'} />
              ) : fileType === 'link' ? (
                <FileTypeLinkIcon className={'h-5 w-5 shrink-0 text-gray-400'} />
              ) : (
                <FileTypeUnknownIcon className={'h-5 w-5 shrink-0 text-gray-400'} />
              )}
            </>
          }
        />
      </div>
      <div className="grow text-ellipsis whitespace-nowrap overflow-hidden">
        <Base>{item.name}</Base>
      </div>
      <div className="shrink-0 ml-4">
        {item?.access_info?.public?.level !== 'none' && (
          <PublicIcon className="h-5 w-5 text-blue-500" />
        )}
      </div>
      <div className="shrink-0 ml-4 text-right" style={{ minWidth: 80 }}>
        <BaseSmall>{formatBytes(item.size)}</BaseSmall>
      </div>
      <div className="shrink-0 ml-4">
        <Menu menu={onBuildContextMenu}>
          <Button
            theme={'secondary'}
            size="sm"
            className={'!rounded-full '}
            icon={DotsHorizontalIcon}
          />
        </Menu>
      </div>
    </div>
  );
};
