/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef } from 'react';
import { Button } from 'antd';
import { MoreHorizontal, RotateCw, X } from 'react-feather';

import {
  isPendingFileStatusPending,
  isPendingFileStatusPause,
  isPendingFileStatusSuccess,
  isPendingFileStatusError,
  isPendingFileStatusCancel,
} from 'app/features/files/utils/pending-files';
import Languages from 'app/features/global/services/languages-service';
import { useUpload } from 'app/features/files/hooks/use-upload';
import { DataFileType } from '../types';
import MenuManager from 'app/components/menus/menus-manager';
import { PendingFileRecoilType } from 'app/features/files/types/file';
import { MessageFileType } from 'app/features/messages/types/message';
import { useFileViewerModal } from 'app/features/viewer/hooks/use-viewer';
import { useEditors } from 'app/views/client/viewer/other/editors-service';

type PropsType = {
  file: DataFileType;
  messageFile: MessageFileType;
  status?: PendingFileRecoilType['status'];
  deletable?: boolean;
  actionMenu?: boolean;
  onRemove?: () => void;
  source?: string;
};

export const FileActions = ({
  file,
  messageFile,
  status,
  deletable,
  actionMenu,
  onRemove,
}: PropsType): JSX.Element => {
  const { cancelUpload, deleteOneFile, downloadOneFile, retryUpload } = useUpload();
  const menuRef = useRef<HTMLElement>();
  const { open: openPreview } = useFileViewerModal();
  const { candidates } = useEditors(file.name.split('.').pop() || '');

  const onClickDownload = async () => {
    file.company_id &&
      (await downloadOneFile({
        companyId: file.company_id,
        fileId: file.id,
        messageFile,
      }));
  };

  const onClickOpen = async () => {
    openPreview(messageFile);
  };

  const buildMenu = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.stopPropagation();

    const menu = [
      {
        type: 'menu',
        text: Languages.t('scenes.apps.drive.download_button'),
        onClick: onClickDownload,
      },
    ];

    if (candidates.length > 0) {
      const openerName = candidates[0].name || candidates[0].app?.identity.name;

      menu.push({
        type: 'menu',
        text: Languages.t(
          'scenes.apps.drive.viewer.edit_with_button',
          [openerName],
          `Edit with ${openerName}`,
        ),
        onClick: onClickOpen,
      });
    }

    MenuManager.openMenu(menu, (window as any).getBoundingClientRect(menuRef.current), null, {
      margin: 0,
    });
  };

  const onClickCancel = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();

    if (status && isPendingFileStatusSuccess(status)) {
      if (file.id) deleteOneFile(file.id);
    } else {
      cancelUpload(file.id);
    }

    if (onRemove) onRemove();
  };

  const onClickRetry = () => {
    retryUpload(file.id);
  };

  const setActions = () => {
    if (actionMenu) {
      return (
        <Button
          ref={node => node && (menuRef.current = node)}
          shape="circle"
          icon={<MoreHorizontal size={16} />}
          onClick={buildMenu}
        />
      );
    }

    if (deletable && status) {
      if (isPendingFileStatusError(status)) {
        return (
          <>
            <Button
              shape="circle"
              icon={<RotateCw size={16} color="var(--error)" />}
              onClick={onClickRetry}
            />
            <Button
              shape="circle"
              icon={<X size={16} color="var(--error)" />}
              onClick={onClickCancel}
            />
          </>
        );
      }

      if (
        isPendingFileStatusPending(status) ||
        isPendingFileStatusPause(status) ||
        isPendingFileStatusSuccess(status)
      ) {
        return <Button shape="circle" icon={<X size={16} />} onClick={onClickCancel} />;
      }

      if (isPendingFileStatusCancel(status)) {
        return <></>;
      }
    }
  };

  return <div className="file-menu">{setActions()}</div>;
};

export default FileActions;
