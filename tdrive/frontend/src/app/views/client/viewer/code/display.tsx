export default (props: { download: string; name: string }) => {
  const extension = props.name?.split('.').pop();
  const url =
    '/public/viewer/CodeViewer/viewer.html?ext=' +
    extension +
    '&link=' +
    encodeURIComponent(props.download);

  return (
    <>
      <iframe
        className="w-full h-full left-0 right-0 absolute bottom-0 top-0"
        title={props.name}
        src={url}
      />
    </>
  );
};
