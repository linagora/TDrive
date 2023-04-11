import Strings from 'features/global/utils/strings';
import { Message, MessageFileType } from 'features/messages/types/message';
import FileUploadService from 'features/files/services/file-upload-service';
import routerService from 'app/features/router/services/router-service';
import { ChannelType } from 'app/features/channels/types/channel';
import ChannelAPIClient from 'app/features/channels/api/channel-api-client';
import { DriveApiClient } from 'app/features/drive/api-client/api-client';
import { DriveItem } from 'app/features/drive/types';
import DriveService from 'app/deprecated/Apps/Drive/Drive.js';

export const highlightText = (text?: string, highlight?: string) => {
  if (!text) {
    return '';
  }
  if (!highlight) {
    return text;
  }
  const reg = new RegExp('(' + Strings.removeAccents(highlight) + ')', 'ig');
  return Strings.removeAccents(text).replace(reg, "<span class='highlight'>$1</span>");
};

export const getFileMessageDownloadRoute = (file: MessageFileType): string => {
  if (file?.metadata?.source === 'internal')
    return FileUploadService.getDownloadRoute({
      companyId: file.metadata?.external_id?.company_id,
      fileId: file.metadata?.external_id?.id,
    });
  return '';
};

export const onFileDownloadClick = (file: MessageFileType) => {
  const url = getFileMessageDownloadRoute(file);

  url && (window.location.href = url);
};

export const openChannel = async (channel: ChannelType, currentWorkspaceId: string) => {
  if (channel.workspace_id === 'direct') {
    const direct = await ChannelAPIClient.getDirect(
      channel.company_id || '',
      channel.members || [],
    );
    if (direct) channel = { ...channel, id: direct.id };
  }

  routerService.push(
    routerService.generateRouteFromState({
      companyId: channel.company_id,
      workspaceId:
        (channel.workspace_id === 'direct' ? undefined : channel.workspace_id) ||
        currentWorkspaceId,
      channelId: channel.id,
    }),
  );
};

export const openMessage = async (message: Message, currentWorkspaceId: string) => {
  routerService.push(
    routerService.generateRouteFromState({
      companyId: message?.cache?.company_id,
      workspaceId:
        message?.cache?.workspace_id === 'direct'
          ? currentWorkspaceId
          : message?.cache?.workspace_id,
      channelId: message?.cache?.channel_id,
      threadId: message?.thread_id,
      ...(message.id !== message?.thread_id ? { messageId: message.id } : {}),
    }),
  );
};


export const openDriveItem = (driveItem: DriveItem, workspace_id: string, drive_app_id: string) => {
  routerService.push(
    routerService.generateRouteFromState({
      companyId: driveItem.company_id,
      workspaceId: workspace_id ,
      channelId: drive_app_id,
    }),
  );
  DriveService.changeCurrentDirectory(drive_app_id, driveItem.parent_id);
}

export const onDriveItemDownloadClick = async (driveItem: DriveItem) => {
  const url = await DriveApiClient.getDownloadUrl(driveItem.company_id, driveItem.id);

  url && (window.location.href = url);
};