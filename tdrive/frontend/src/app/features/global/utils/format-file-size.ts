export const formatSize = (size?: number) => {
  if (size && size >= 0) {
    let pos = 0;
    while (size > 1024) {
      size = size / 1024;
      pos++;
    }
    return size.toFixed(2) + ' ' + ['B', 'KB', 'MB', 'GB', 'TB', 'PB'][pos];
  }
  return 'Unknown size';
};
