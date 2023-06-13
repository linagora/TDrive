export type PreviewMessageQueueRequest = {
  document: {
    id: string;
    provider: string;
    path: string;
    encryption_algo?: string;
    encryption_key?: string;
    chunks?: number;
    mime?: string;
    filename?: string;
  };
  output: {
    provider: string;
    path: string;
    encryption_algo?: string;
    encryption_key?: string;
    pages?: number; //Max number of pages for the document
    width?: number; //Max width for the thumbnails
    height?: number; //Max height for the thumbnails
  };
};

export type PreviewClearMessageQueueRequest = {
  document: {
    id: string;
    provider: string;
    path: string;
    thumbnails_number: number;
  };
};

export type PreviewMessageQueueCallback = {
  document: {
    id: string;
    path: string;
    provider: string;
  };
  thumbnails: {
    path: string;
    size: number;
    type: string;
    width: number;
    height: number;
    provider?: string;
    index?: number;
  }[];
};

export type ThumbnailResult = {
  path: string;
  width: number;
  height: number;
  size: number;
  type: string;
};

export type temporaryThumbnailFile = {
  filePath: string;
  fileName: string;
  folder: string;
};
