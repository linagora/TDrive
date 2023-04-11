import { useEffect, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

let imageControls: {
  zoomIn: () => void;
  zoomOut: () => void;
  rotateCw: () => void;
} = {
  zoomIn: () => undefined,
  zoomOut: () => undefined,
  rotateCw: () => undefined,
};

type PropsType = {
  download: string;
  loading: boolean;
  setLoading: (state: boolean) => void 
}

export const getImageControls = () => {
  return imageControls;
};

export default ({ download, loading, setLoading}: PropsType) => {
  const [rotated, setRotated] = useState(0);

  useEffect(() => {
    setLoading(true);
  }, []);

  return (
    <TransformWrapper initialScale={0.9}>
      {({ zoomIn, zoomOut }) => {
        imageControls = { zoomIn, zoomOut, rotateCw: () => setRotated(rotated + 90) };
        return (
          <TransformComponent wrapperClass="absolute w-full h-full top-0 left-0 right-0 bottom-0">
            <img
              className="object-contain"
              style={{
                transform: `rotate(${rotated}deg)`,
                transition: 'transform 200ms',
                width: '90vw',
                height: '90vh',
                opacity: loading ? 0 : 1,
              }}
              src={download}
              onLoad={() => {
                zoomOut();
                setLoading(false);
              }}
            />
          </TransformComponent>
        );
      }}
    </TransformWrapper>
  );
};
