import FileUploadAPIClient from '@features/files/api/file-upload-api-client';
import { MessageFileType } from '@features/messages/types/message';
import Media from '@molecules/media';
import { useFileViewerModal } from 'app/features/viewer/hooks/use-viewer';

export default (props: { file: MessageFileType }) => {
  const file = props.file;
  const url = FileUploadAPIClient.getFileThumbnailUrlFromMessageFile(file);
  const type = FileUploadAPIClient.mimeToType(file?.metadata?.mime || '');
  const { open: openViewer } = useFileViewerModal();

  return (
    <div
      className="cursor-pointer hover:opacity-75 inline-block m-2"
      onClick={() => openViewer(file)}
    >
      <Media
        key={file.id}
        size="lg"
        url={url}
        duration={
          type === 'video'
            ? file?.metadata?.name?.split('.').slice(-1)?.[0]?.toLocaleUpperCase()
            : undefined
        }
      />
    </div>
  );
};
