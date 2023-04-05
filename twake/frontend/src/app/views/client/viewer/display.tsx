import {
  useFileViewerModal,
  useViewerDataLoading,
  useViewerDisplayData,
} from 'app/features/viewer/hooks/use-viewer';
import ImageDisplay from './images/display';
import VideoDisplay from './videos/display';
import PdfDisplay from './pdf/display';
import CodeDisplay from './code/display';
import ArchiveDisplay from './archive/display';
import OtherDisplay from './other/display';

export default () => {
  const { download, type, name, id } = useViewerDisplayData();
  const { isOpen } = useFileViewerModal();
  const { loading, setLoading } = useViewerDataLoading();

  if (!download || !isOpen) {
    return <></>;
  }

  if (type === 'image') {
    return <ImageDisplay loading={loading} setLoading={setLoading}  download={download} />;
  }

  if (type === 'video' || type === 'audio') {
    return <VideoDisplay download={download} />;
  }

  if (type === 'pdf') {
    return <PdfDisplay download={download} name={name} />;
  }

  if (type === 'code') {
    return <CodeDisplay download={download} name={name} />;
  }

  if (type === 'archive') {
    return <ArchiveDisplay download={download} name={name} />;
  }

  // /* Uncomment after https://github.com/linagora/Tdrive/issues/2453 is done
  if (type) {
    return <OtherDisplay download={download} name={name} id={id} />;
  }

  return (
    <div className="text-white m-auto w-full text-center block h-full flex items-center">
      <span className="block w-full text-center">We can't display this document.</span>
    </div>
  );
};
