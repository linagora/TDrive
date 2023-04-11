import { Button } from 'app/atoms/button/button';
import { useDrivePreviewDisplayData } from 'app/features/drive/hooks/use-drive-preview';
import { useEffect, useState } from 'react';

export default (props: { download: string; name: string }) => {
  const { size } = useDrivePreviewDisplayData();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const openLink = async () => {
    if ((size || 10000000) < 10000) {
      setLoading(true);
      //Download file content and extract link from url props.download
      try {
        const response = await fetch(props.download);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.readAsText(blob);
        reader.onloadend = () => {
          const result = reader.result as string;
          const link = result.match(/URL=(.*)/);
          if (link && link[1]) {
            if (!link[1].match(/^(http|https):\/\//)) throw new Error('Invalid link');
            window.open(link[1], '_blank');
          } else {
            setError(true);
          }
          setLoading(false);
        };
      } catch (e) {
        setError(true);
        setLoading(false);
      }
      return;
    }
    setError(true);
  };

  useEffect(() => {
    openLink();
  }, []);

  if (loading) {
    return (
      <div className="text-white m-auto w-full text-center h-full flex items-center">
        <span className="block w-full text-center">Opening link...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-white m-auto w-full text-center h-full flex items-center">
        <span className="block w-full text-center">
          We can't open '{props.name}' as a link. You can download it instead.
        </span>
      </div>
    );
  }

  return (
    <div className="text-white m-auto w-full text-center h-full flex items-center">
      <span className="block w-full text-center">
        Link was open on another tab.
        <br />
        <br />
        <Button onClick={() => openLink()}>Open again</Button>
      </span>
    </div>
  );
};
