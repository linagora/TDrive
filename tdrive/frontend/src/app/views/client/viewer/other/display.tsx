import { useEffect, useState } from 'react';
import { useEditors } from './editors-service';

export default (props: { download: string; name: string; id: string }) => {
  const extension = props.name.split('.').pop();
  const { getPreviewUrl } = useEditors(extension || '');
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (!previewUrl) setPreviewUrl(getPreviewUrl(props.id) || '');
  }, [previewUrl, setPreviewUrl]);

  if (!(props.id && previewUrl)) {
    return (
      <>
        <div className="text-white m-auto w-full text-center block h-full flex items-center">
          <span className="block w-full text-center">We can't display this document.</span>
        </div>
      </>
    );
  }

  return (
    <>
      {props.id && previewUrl && (
        <iframe
          className="w-full h-full left-0 right-0 absolute bottom-0 top-0"
          title={props.name}
          src={previewUrl}
        />
      )}
    </>
  );
};
