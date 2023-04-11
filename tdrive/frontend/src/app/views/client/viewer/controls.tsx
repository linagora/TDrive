import ImageControls from './images/controls';
import VideoControls from './videos/controls';
import PdfControls from './pdf/controls';
import ArchiveControls from './archive/controls';
import CodeControls from './code/controls';
import OtherControls from './other/controls';

type PropsType = {
  type: string;
};

export default ({ type }: PropsType) => {
  if (!type) {
    return <></>;
  }

  if (type === 'image') {
    return <ImageControls />;
  }

  if (type === 'video' || type === 'audio') {
    return <VideoControls />;
  }

  if (type === 'pdf') {
    return <PdfControls />;
  }

  if (type === 'code') {
    return <CodeControls />;
  }

  if (type === 'archive') {
    return <ArchiveControls />;
  }

  if (type) {
    return <OtherControls />;
  }

  return <></>;
};
