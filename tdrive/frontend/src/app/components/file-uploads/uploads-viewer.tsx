import React from 'react';
import { useUpload } from 'app/features/files/hooks/use-upload';
import PendingFilesList from './pending-file-components/pending-files-list';

const ChatUploadsViewer = (): JSX.Element => {
  const { currentTask } = useUpload();

  return (
    <PendingFilesList
      visible={!!currentTask && currentTask.files.length > 0 && !currentTask.completed}
      pendingFilesState={currentTask.files}
    />
  );
};

export default ChatUploadsViewer;
