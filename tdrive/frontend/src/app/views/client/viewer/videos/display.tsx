import ReactPlayer from 'react-player';

export default (props: { download: string }) => {
  return (
    <ReactPlayer
      url={props.download}
      className="max-w-full max-h-full m-auto absolute left-0 top-0 bottom-0 right-0"
      controls
    />
  );
};
