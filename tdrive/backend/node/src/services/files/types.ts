export type UploadOptions = {
  filename: string;
  type: string;
  totalSize: number;
  totalChunks: number;
  chunkNumber: number;
  waitForThumbnail: boolean;
  ignoreThumbnails: boolean;
};
