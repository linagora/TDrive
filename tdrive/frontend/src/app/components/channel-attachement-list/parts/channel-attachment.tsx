import { Button } from 'app/atoms/button/button';
import { DownloadIcon } from 'app/atoms/icons-agnostic';
import {
  FileTypeArchiveIcon,
  FileTypeDocumentIcon,
  FileTypePdfIcon,
  FileTypeSlidesIcon,
  FileTypeSpreadsheetIcon,
  FileTypeUnknownIcon,
} from 'app/atoms/icons-colored';
import { Base, Info } from 'app/atoms/text';
import { channelAttachmentListState } from 'app/features/channels/state/channel-attachment-list';
import fileUploadApiClient from 'app/features/files/api/file-upload-api-client';
import fileUploadService from 'app/features/files/services/file-upload-service';
import { formatDate } from 'app/features/global/utils/format-date';
import { formatSize } from 'app/features/global/utils/format-file-size';
import { Message, MessageFileType } from 'app/features/messages/types/message';
import routerService from 'app/features/router/services/router-service';
import { UserType } from 'app/features/users/types/user';
import { useFileViewerModal } from 'app/features/viewer/hooks/use-viewer';
import Media from 'app/molecules/media';
import React from 'react';
import { ArrowRight } from 'react-feather';
import { useRecoilState } from 'recoil';

type FileMessageType = {
  message?: Message;
};

type FileUserType = {
  user?: UserType;
};

type PropsType = {
  file: MessageFileType & FileMessageType & FileUserType;
  is_media: boolean;
};

type FilePreviewType = {
  file: MessageFileType & FileMessageType & FileUserType;
};

export default ({ file, is_media }: PropsType): React.ReactElement => {
  return is_media ? <ChannelMedia file={file} /> : <ChannelFile file={file} />;
};

const ChannelFile = ({ file }: FilePreviewType): React.ReactElement => {
  const [, setOpen] = useRecoilState(channelAttachmentListState);
  const name = file?.metadata?.name;
  const extension = name?.split('.').pop();
  const previewUrl = fileUploadApiClient.getFileThumbnailUrlFromMessageFile(file);
  const fileType = fileUploadApiClient.mimeToType(file?.metadata?.mime || '');
  const { open: openViewer } = useFileViewerModal();

  const iconClassName = previewUrl
    ? 'absolute left-0 top-0 bottom-0 right-0 m-auto w-8 h-8'
    : 'absolute bottom-1 left-1 w-6 h-6';

  return (
    <div
      className="flex items-center p-2 hover:bg-zinc-50 rounded-md cursor-pointer"
      onClick={() => openViewer(file)}
    >
      <div className="relative flex bg-zinc-200 rounded-md w-16 h-16 mr-3">
        <Media size="md" url={previewUrl} duration={fileType === 'video' ? extension : undefined} />
        {(!['image', 'video'].includes(fileType) || !previewUrl) && (
          <>
            {fileType === 'archive' ? (
              <FileTypeArchiveIcon className={iconClassName} />
            ) : fileType === 'pdf' ? (
              <FileTypePdfIcon className={iconClassName} />
            ) : fileType === 'document' ? (
              <FileTypeDocumentIcon className={iconClassName} />
            ) : fileType === 'slides' ? (
              <FileTypeSlidesIcon className={iconClassName} />
            ) : fileType === 'spreadsheet' ? (
              <FileTypeSpreadsheetIcon className={iconClassName} />
            ) : (
              <FileTypeUnknownIcon className={iconClassName} />
            )}
          </>
        )}
      </div>
      <div className="grow mr-3 overflow-hidden">
        <Base className="block whitespace-nowrap overflow-hidden text-ellipsis">{name}</Base>
        <Info className="block whitespace-nowrap overflow-hidden text-ellipsis">
          {extension?.toLocaleUpperCase()} • {formatDate(file?.message?.created_at)} •{' '}
          {formatSize(file?.metadata?.size)}
        </Info>
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
          onClick={() => downloadFile(file)}
        >
          <DownloadIcon className="w-6 h-6" />
        </Button>

        {!!file.message && (
          <Button
            theme="outline"
            className="w-9 px-1.5 ml-2 rounded-full border-none"
            onClick={() => {
              setOpen(false);
              gotoMessage(file.message as Message);
            }}
          >
            <ArrowRight className="w-6 h-6" />
          </Button>
        )}
      </div>
    </div>
  );
};

const ChannelMedia = ({ file }: FilePreviewType): React.ReactElement => {
  const previewUrl = fileUploadApiClient.getFileThumbnailUrlFromMessageFile(file);
  const type = fileUploadApiClient.mimeToType(file?.metadata?.mime || '');
  const { open: openViewer } = useFileViewerModal();

  return (
    <div
      className="cursor-pointer hover:opacity-75 inline-block m-2"
      onClick={() => openViewer(file)}
    >
      <Media
        key={file.id}
        size="lg"
        url={previewUrl}
        duration={
          type === 'video'
            ? file?.metadata?.name?.split('.').slice(-1)?.[0]?.toLocaleUpperCase()
            : undefined
        }
      />
    </div>
  );
};

const getFileDownloadRoute = (file: MessageFileType): string => {
  if (file?.metadata?.source !== 'internal') {
    return '';
  }

  return fileUploadService.getDownloadRoute({
    companyId: file.metadata?.external_id?.company_id,
    fileId: file.metadata?.external_id?.id,
  });
};

const downloadFile = (file: MessageFileType): void => {
  const url = getFileDownloadRoute(file);

  if (url) {
    window.location.href = url;
  }
};

const gotoMessage = (message: Message): void => {
  routerService.push(
    routerService.generateRouteFromState({
      companyId: message?.cache?.company_id,
      channelId: message?.cache?.channel_id,
      threadId: message?.thread_id,
      workspaceId: message?.cache?.workspace_id,
      ...(message.id !== message?.thread_id ? { messageId: message.id } : {}),
    }),
  );
};
