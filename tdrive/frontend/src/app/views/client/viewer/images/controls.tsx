import { Button } from 'app/atoms/button/button';
import { ZoomOutIcon, ZoomInIcon, RotateCwIcon } from 'app/atoms/icons-agnostic';
import { getImageControls } from './display';

export default () => {
  return (
    <>
      <Button
        iconSize="lg"
        className="ml-4 !rounded-full"
        theme="dark"
        size="lg"
        icon={ZoomOutIcon}
        onClick={() => getImageControls().zoomOut()}
      />
      <Button
        iconSize="lg"
        className="ml-4 !rounded-full"
        theme="dark"
        size="lg"
        icon={ZoomInIcon}
        onClick={() => getImageControls().zoomIn()}
      />
      <Button
        iconSize="lg"
        className="ml-4 !rounded-full"
        theme="dark"
        size="lg"
        icon={RotateCwIcon}
        onClick={() => getImageControls().rotateCw()}
      />
    </>
  );
};
