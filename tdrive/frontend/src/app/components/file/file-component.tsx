/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import classNames, { Argument } from 'classnames';

import { FileThumbnail, FileDetails, FileActions, FileProgress } from './parts';
import {
  isPendingFileStatusCancel,
  isPendingFileStatusError,
  isPendingFileStatusSuccess,
} from 'app/features/files/utils/pending-files';
import { DataFileType } from './types';
import DriveService from 'app/deprecated/Apps/Drive/Drive.js';
import RouterService from 'app/features/router/services/router-service';

import './file.scss';
import { PendingFileRecoilType } from 'app/features/files/types/file';
import Api from 'app/features/global/framework/api-service';
import FileUploadAPIClient from '../../features/files/api/file-upload-api-client';
import LargePreview from './parts/large-preview';
import { MessageFileType } from 'app/features/messages/types/message';
import { useFileViewerModal } from 'app/features/viewer/hooks/use-viewer';

type PropsType = {
  source: 'internal' | 'drive' | string;
  externalId: string | any;
  file: DataFileType;
  messageFile: MessageFileType;
  context: 'input' | 'message' | 'drive';
  progress?: number;
  status?: PendingFileRecoilType['status'];
  onRemove?: () => void;
  className?: string;
  large?: boolean;
  xlarge?: boolean;
};

export default ({
  source,
  externalId,
  file: _file,
  messageFile,
  className,
  context,
  progress,
  status,
  onRemove,
  large,
  xlarge,
}: PropsType) => {
  const { companyId, workspaceId } = RouterService.getStateFromRoute();
  const [file, setFile] = useState<DataFileType>(_file);
  const classNameArguments: Argument[] = [
    'file-component',
    className,
    { 'large-view': large },
    {
      'file-component-error':
        status && (isPendingFileStatusError(status) || isPendingFileStatusCancel(status)),
      'file-component-uploading': progress != undefined && progress < 1,
    },
  ];

  const { open: openViewer } = useFileViewerModal();

  useEffect(() => {
    if (source === 'drive') {
      (async () => {
        if (typeof externalId === 'string') {
          externalId = { id: externalId, workspace_id: workspaceId };
        }

        let driveFile = (await Api.post('/ajax/drive/v2/find', {
          options: {
            element_id: externalId?.id,
            workspace_id: externalId?.workspace_id,
          },
        })) as any;
        driveFile = driveFile?.data || {};

        setFile({
          ...file,
          thumbnail: driveFile.preview_link,
          name: driveFile.name,
          size: driveFile.size,
          type: FileUploadAPIClient.mimeToType(
            FileUploadAPIClient.extensionToMime(driveFile.extension),
          ),
        });
      })();
    } else {
      setFile(_file);
    }
  }, [_file]);

  const onClickFile = async () => {
    if (source === 'internal') {
      //Only if upload has ended
      if ((!status || isPendingFileStatusSuccess(status)) && file.id) openViewer(messageFile);
    }
    if (source === 'drive') {
      if (typeof externalId === 'string') {
        externalId = { id: externalId, workspace_id: workspaceId };
      }

      const file = (await Api.post('/ajax/drive/v2/find', {
        options: {
          element_id: externalId?.id,
          workspace_id: externalId?.workspace_id,
        },
      })) as any;
      DriveService.viewDocument(file?.data, context === 'input');
    }
  };

  let computedHeight = 200;
  let computedWidth = file.thumbnail_ratio * 200;
  const isMediaFile = ['image', 'video'].includes(file.type);

  if (xlarge) {
    computedWidth = Math.max(
      160,
      Math.min(
        Math.min(messageFile.metadata?.thumbnails?.[0]?.width || 600, 600),
        file.thumbnail_ratio * document.body.clientHeight * 0.5,
      ),
    );
    computedHeight = Math.max(
      200,
      Math.min(
        Math.min(
          messageFile.metadata?.thumbnails?.[0]?.height || 10000,
          document.body.clientHeight * 0.5,
        ),
        computedWidth / file.thumbnail_ratio,
      ),
    );
  }

  return (
    <div
      className={classNames(classNameArguments)}
      style={large ? { width: computedWidth, height: computedHeight } : {}}
      onClick={() => companyId && onClickFile()}
    >
      {large && <LargePreview file={file} />}
      <div
        className={classNames('file-info-container', {
          'media-file-info-container': isMediaFile,
        })}
      >
        <FileThumbnail file={file} />
        <FileDetails file={file} source={source} />
        <FileActions
          deletable={context === 'input'}
          actionMenu={context === 'message' && source === 'internal'}
          status={status}
          file={file}
          messageFile={messageFile}
          onRemove={onRemove}
          source={source}
        />
      </div>
      <FileProgress progress={progress} status={status} file={file} />
    </div>
  );
};
