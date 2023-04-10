import {
  useDrivePreviewDisplayData,
  useDrivePreviewLoading,
  useDrivePreviewModal,
} from 'app/features/drive/hooks/use-drive-preview';
import ImageDisplay from './images/display';
import VideoDisplay from './videos/display';
import PdfDisplay from './pdf/display';
import CodeDisplay from './code/display';
import ArchiveDisplay from './archive/display';
import OtherDisplay from './other/display';
import LinkDisplay from './link/display';

export default (): React.ReactElement => {
  const { download, type, name, id } = useDrivePreviewDisplayData();
  const { isOpen } = useDrivePreviewModal();
  const { loading, setLoading } = useDrivePreviewLoading();

  if (!download || !isOpen || !id) {
    return <></>;
  }

  if (!type) {
    return (
      <div className="text-white m-auto w-full text-center h-full flex items-center">
        <span className="block w-full text-center">We can't display this document.</span>
      </div>
    );
  }

  switch (type) {
    case 'image':
      return <ImageDisplay loading={loading} setLoading={setLoading} download={download} />;
    case 'video':
    case 'audio':
      return <VideoDisplay download={download} />;
    case 'code':
      return <CodeDisplay download={download} name={name} />;
    case 'archive':
      return <ArchiveDisplay download={download} name={name} />;
    case 'pdf':
      return <PdfDisplay download={download} name={name} />;
    case 'link':
      return <LinkDisplay download={download} name={name} />;
    default:
      return <OtherDisplay download={download} name={name} id={id} />;
  }
};
