import { ExecutionContext } from "../../core/platform/framework/api/crud-service";
import { DriveFile } from "./entities/drive-file";
import { FileVersion } from "./entities/file-version";

export interface CompanyExecutionContext extends ExecutionContext {
  company: { id: string };
}

export type DriveExecutionContext = CompanyExecutionContext & {
  public_token?: string;
};

export type RequestParams = {
  company_id: string;
};

export type ItemRequestParams = RequestParams & {
  id: string;
};

export type DriveItemDetails = {
  path: DriveFile[];
  item?: DriveFile;
  versions?: FileVersion[];
  children: DriveFile[];
  access: DriveFileAccessLevel | "none";
};

export type DriveFileAccessLevel = "read" | "write" | "manage";
export type publicAccessLevel = "write" | "read" | "none";

export type RootType = "root";
export type TrashType = "trash";

export type DownloadZipBodyRequest = {
  items: string[];
};

export type SearchDocumentsOptions = {
  search?: string;
  company_id?: string;
  creator?: string;
  added?: string;
  mime_type?: Array<string>;
  last_modified_lt?: number;
  last_modified_gt?: number;
};

export type SearchDocumentsBody = {
  search?: string;
  company_id?: string;
  creator?: string;
  added?: string;
  mime_type?: [string];
  last_modified_lt?: number;
  last_modified_gt?: number;
};

export type DocumentsMessageQueueRequest = {
  item: DriveFile;
  version: FileVersion;
  context: CompanyExecutionContext;
};

export type DocumentsMessageQueueCallback = {
  item: DriveFile;
  content_keywords: string;
};

export type exportKeywordPayload = {
  file_id: string;
  company_id: string;
};

export type DriveTdriveTab = {
  company_id: string;
  tab_id: string;
  channel_id: string;
  item_id: string;
  level: "read" | "write";
};
