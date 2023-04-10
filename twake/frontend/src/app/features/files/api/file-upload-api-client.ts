import Api from 'app/features/global/framework/api-service';
import { FileType } from 'app/features/files/types/file';
import { MessageFileType } from 'app/features/messages/types/message';
import extensionToMime from '../utils/extension-to-mime';
import { fileTypeMimes } from '../utils/type-mimes';
import AceModeList from '@features/global/utils/ace_modelist.js';

type ResponseFileType = { resource: FileType };
type ResponseDeleteFileType = { status: 'success' | 'error' };

type BaseContentType = { companyId: string };
type GetContextType = BaseContentType & { fileId: string };
type DeleteContextType = BaseContentType & { fileId: string };
type DownloadContextType = BaseContentType & { fileId: string };

export type FileTypes =
  | 'link'
  | 'code'
  | 'document'
  | 'image'
  | 'pdf'
  | 'slides'
  | 'audio'
  | 'spreadsheet'
  | 'video'
  | 'archive'
  | 'other';

class FileUploadAPIClient {
  private readonly prefixUrl: string = '/internal/services/files/v1';

  public upload(file: File, context: BaseContentType): Promise<ResponseFileType> {
    const uploadFileRoute = `${this.getRoute({ companyId: context.companyId })}?filename=${
      file.name
    }&type=${file.type}&total_size=${file.size}`;

    return Api.post<undefined, ResponseFileType>(uploadFileRoute, undefined);
  }

  public get({ companyId, fileId }: GetContextType): Promise<ResponseFileType> {
    const getFileRoute = this.getRoute({ fileId, companyId });

    return Api.get<ResponseFileType>(getFileRoute);
  }

  public getRoute({
    companyId,
    fileId = undefined,
    fullApiRouteUrl = false,
    download,
  }: {
    companyId: string;
    fileId?: string;
    fullApiRouteUrl?: boolean;
    download?: boolean;
  }): string {
    const route = `${this.prefixUrl}/companies/${companyId}/files${
      fileId !== undefined ? `/${fileId}${download ? '/download' : ''}` : ''
    }`;

    return fullApiRouteUrl ? Api.route(route) : route;
  }

  public getFileThumbnailUrl(file: Pick<FileType, 'id' | 'company_id' | 'thumbnails'>): string {
    if (!file.thumbnails?.[0]?.index) return '';
    return `${this.getRoute({
      companyId: file.company_id,
      fileId: file.id,
      fullApiRouteUrl: true,
    })}/thumbnails/${file.thumbnails?.[0]?.index}`;
  }

  public getFileThumbnailUrlFromMessageFile(file: MessageFileType): string {
    if (file.metadata?.source !== 'internal') return file.metadata?.thumbnails?.[0]?.url || '';
    if (!file.metadata?.thumbnails?.[0]) {
      return '';
    }
    return `${this.getRoute({
      companyId:
        (typeof file.metadata?.external_id === 'string'
          ? file.company_id
          : file.metadata?.external_id?.company_id) || '',
      fileId:
        (typeof file.metadata?.external_id === 'string'
          ? file.metadata?.external_id
          : file.metadata?.external_id?.id) || '',
      fullApiRouteUrl: true,
    })}/thumbnails/${file.metadata?.thumbnails?.[0]?.index}`;
  }

  public delete({ companyId, fileId }: DeleteContextType): Promise<ResponseDeleteFileType> {
    const deleteFileRoute = this.getRoute({ companyId, fileId });
    return Api.delete<ResponseDeleteFileType>(deleteFileRoute, undefined);
  }

  public download({ companyId, fileId }: DownloadContextType): Promise<Blob> {
    const downloadFileRoute = this.getRoute({ companyId, fileId, download: true });
    return Api.get<Blob>(downloadFileRoute, undefined, true, {
      withBlob: true,
    });
  }

  public getDownloadRoute({ companyId, fileId }: DownloadContextType): string {
    return this.getRoute({ companyId, fileId, download: true, fullApiRouteUrl: true });
  }

  public mimeToType(mime: string, extension?: string): FileTypes {
    const { archives, images, pdf, slides, audio, spreadsheets, videos, documents, links } =
      fileTypeMimes;

    if (images.includes(mime)) return 'image';
    if (videos.includes(mime)) return 'video';
    if (audio.includes(mime)) return 'audio';
    if (pdf.includes(mime)) return 'pdf';
    if (slides.includes(mime)) return 'slides';
    if (archives.includes(mime)) return 'archive';
    if (spreadsheets.includes(mime)) return 'spreadsheet';
    if (documents.includes(mime)) return 'document';
    if (links.includes(mime)) return 'link';

    if (extension && AceModeList.getMode(extension) !== 'text') {
      return 'code';
    }

    return 'other';
  }

  public extensionToMime(extension: string): string {
    return extensionToMime[extension] || '';
  }

  async recent(companyId: string, filter: 'file' | 'media', limit: number): Promise<FileType[]> {
    const fileRoute = `/internal/services/messages/v1/companies/${companyId}/files?type=user_upload&media=${filter}_only&limit=${limit}`;
    return Api.get<{ resources: FileType[] }>(fileRoute).then(a => a.resources);
  }
}

export default new FileUploadAPIClient();
