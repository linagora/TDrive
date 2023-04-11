import { PendingFileRecoilType } from 'app/features/files/types/file';

export const isPendingFileStatusPause = (status: PendingFileRecoilType['status']): boolean => {
  return status === 'pause' ? true : false;
};

export const isPendingFileStatusError = (status: PendingFileRecoilType['status']): boolean => {
  return status === 'error' ? true : false;
};

export const isPendingFileStatusCancel = (status: PendingFileRecoilType['status']): boolean => {
  return status === 'cancel' ? true : false;
};

export const isPendingFileStatusPending = (status: PendingFileRecoilType['status']): boolean => {
  return status === 'pending' ? true : false;
};

export const isPendingFileStatusSuccess = (status: PendingFileRecoilType['status']): boolean => {
  return status === 'success' ? true : false;
};
