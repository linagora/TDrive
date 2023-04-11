import FileUploadService from 'app/features/files/services/file-upload-service';
import { useRecoilState, useRecoilValue } from 'recoil';
import { PendingFilesListState } from '../state/atoms/pending-files-list';
import { CurrentTaskSelector } from '../state/selectors/current-task';
import RouterServices from 'app/features/router/services/router-service';
import { MessageFileType } from 'app/features/messages/types/message';

export const useUpload = () => {
  const { companyId } = RouterServices.getStateFromRoute();
  const [pendingFilesListState, setPendingFilesListState] = useRecoilState(PendingFilesListState);
  FileUploadService.setRecoilHandler(setPendingFilesListState);

  const currentTask = useRecoilValue(CurrentTaskSelector);

  const pauseOrResumeUpload = (id: string) => FileUploadService.pauseOrResume(id);

  const cancelUpload = (id: string) => FileUploadService.cancel(id);

  const getOnePendingFile = (id: string) => FileUploadService.getPendingFile(id);

  const deleteOneFile = (id: string) => {
    if (companyId) FileUploadService.deleteOneFile({ companyId, fileId: id });
  };

  const downloadOneFile = ({
    companyId,
    fileId,
    messageFile,
    blob,
  }: {
    companyId: string;
    fileId: string;
    messageFile: MessageFileType;
    blob?: boolean;
  }) => {
    if (messageFile) FileUploadService.markAsDownloadedFromMessage(messageFile);

    if (blob) {
      return FileUploadService.download({ companyId, fileId });
    }

    const url = FileUploadService.getDownloadRoute({
      companyId,
      fileId,
    });

    url && (window.location.href = url);
  };

  const retryUpload = (id: string) => FileUploadService.retry(id);

  return {
    pendingFilesListState,
    pauseOrResumeUpload,
    cancelUpload,
    getOnePendingFile,
    currentTask,
    deleteOneFile,
    downloadOneFile,
    retryUpload,
  };
};
