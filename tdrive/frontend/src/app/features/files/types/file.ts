import Resumable from 'app/features/files/utils/resumable';
import { ThumbnailType } from '../../messages/types/message';
import { UserType } from 'app/features/users/types/user';

export type MetaDataType = {
  thumbnails?: ThumbnailType[];
  size?: number;
  name: string;
  mime: string;
  thumbnails_status?: string;
};

export type FileUploadDataObjectType = {
  size: number;
  chunks: number;
};

export type FileType = {
  company_id: string;
  id: string;
  application_id: string;
  created_at: number;
  encryption_key: string;
  metadata: MetaDataType;
  thumbnails: ThumbnailType[];
  updated_at: number;
  upload_data: FileUploadDataObjectType;
  user_id: string;
  user?: UserType;
};

export type PendingFileRecoilType = {
  id: string;
  status: 'pending' | 'error' | 'success' | 'pause' | 'cancel';
  progress: number; //Between 0 and 1
  file: FileType | null;
};

export type PendingFileType = {
  resumable: typeof Resumable | null; //Contain the resumable instance in charge of this file
  uploadTaskId: string;
  id: string;
  status: 'pending' | 'error' | 'success' | 'pause' | 'cancel';
  progress: number; //Between 0 and 1
  originalFile: File; //Will be used to get filename, temporary thumbnail
  backendFile: FileType | null; //Will contain the final object returned by API
  lastProgress: number;
  speed: number;
};
