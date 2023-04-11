import React from 'react';
import { Progress } from 'antd';

import { DataFileType } from '../types';
import { PendingFileRecoilType } from 'app/features/files/types/file';
import {
  isPendingFileStatusPending,
  isPendingFileStatusPause,
  isPendingFileStatusSuccess,
  isPendingFileStatusError,
  isPendingFileStatusCancel,
} from 'app/features/files/utils/pending-files';

type PropsType = {
  file: DataFileType;
  status?: PendingFileRecoilType['status'];
  progress?: number;
};

const setStatus = (status: PendingFileRecoilType['status']): 'normal' | 'exception' | 'active' => {
  switch (status) {
    case 'error':
    case 'pause':
      return 'exception';
    case 'pending':
      return 'active';
    default:
      return 'normal';
  }
};

export const FileProgress = ({ status, progress }: PropsType): JSX.Element => {
  const setProgressStrokeColor = (): string => {
    if (!status) return '';

    if (isPendingFileStatusCancel(status)) return 'var(--error)';
    if (isPendingFileStatusError(status)) return 'var(--error)';
    if (isPendingFileStatusPause(status)) return 'var(--warning)';
    if (isPendingFileStatusPending(status)) return 'var(--progress-bar-color)';

    return 'var(--success)';
  };

  return status && !isPendingFileStatusSuccess(status) && progress != undefined ? (
    <div className="file-progress-bar-container">
      <Progress
        type="line"
        className="file-progress-bar"
        percent={progress * 100}
        showInfo={false}
        status={setStatus(status)}
        strokeColor={setProgressStrokeColor()}
        trailColor="var(--progress-bar-background)"
      />
    </div>
  ) : (
    <div className="file-progress-bar-container" />
  );
};

export default FileProgress;
