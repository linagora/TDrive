import fileUploadApiClient from '@features/files/api/file-upload-api-client';
import fileUploadService from '@features/files/services/file-upload-service';
import { useGlobalEffect } from '@features/global/hooks/use-global-effect';
import { LoadingState } from '@features/global/state/atoms/Loading';
import { useRecoilState } from 'recoil';
import { DriveApiClient } from '../api-client/api-client';
import { DriveViewerState } from '../state/viewer';
import { DriveItem } from '../types';

export const useDrivePreviewModal = () => {
  const [status, setStatus] = useRecoilState(DriveViewerState);

  const open: (item: DriveItem) => void = (item: DriveItem) => {
    if (item.last_version_cache?.file_metadata?.source === 'internal') {
      setStatus({ item, loading: true });
    }
  };

  interface CustomWindow extends Window {
    item?: DriveItem;
    directoryPath?: string;
  }
  const openNewWindow: (item: DriveItem) => Promise<void> = async (item: DriveItem) => {
    if (item.is_directory) {
      const directoryPath = await getDirectoryPath(item);
      console.log('Directory Path:', directoryPath);
  
      const currentPath = window.location.pathname;
      const newURL = `${window.location.origin}${currentPath}?directory=${encodeURIComponent(directoryPath)}`;
      const newWindow = window.open(newURL, '_blank') as CustomWindow;
      if (newWindow) {
        newWindow.opener = null;
        newWindow.addEventListener('DOMContentLoaded', () => {
          newWindow.item = item;
          newWindow.directoryPath = directoryPath;
        });
      }
    }
  
    if (item.last_version_cache?.file_metadata?.source === 'internal') {
      const currentURL = window.location.href;
      const previewWindow = window.open(currentURL, '_blank');
    }
  };

  const close = () => {
    if (status.previewWindow) {
      status.previewWindow.close();
    }
    setStatus({ item: null, loading: true, previewWindow: null});
  };

  return { open, openNewWindow, close, isOpen: !!status.item };
};

export const useDrivePreview = () => {
  const [status, setStatus] = useRecoilState(DriveViewerState);
  const modal = useDrivePreviewModal();

  useGlobalEffect(
    'useDrivePreview',
    async () => {
      if (modal.isOpen && status.item) {
        setStatus({
          ...status,
          loading: true,
        });

        const details = await DriveApiClient.get(status.item.company_id, status.item.id);

        setStatus({
          ...status,
          details,
          loading: false,
        });
      }
    },
    [status.item?.id],
  );

  return {
    ...modal,
    status,
    loading: status.loading,
  };
};

export const useDrivePreviewLoading = () => {
  const [loading, setLoading] = useRecoilState(LoadingState('useDrivePreviewLoading'));

  return { loading, setLoading };
};

export const useDrivePreviewDisplayData = () => {
  const { status } = useDrivePreview();

  if (!status) {
    return {};
  }

  const name =
    status.details?.item.last_version_cache.file_metadata.name || status.details?.item.name || '';
  const extension = name.split('.').pop();
  const type = fileUploadApiClient.mimeToType(
    status.details?.item.last_version_cache.file_metadata.mime || '',
    extension,
  );
  const id = status.details?.item.last_version_cache.file_metadata.external_id || '';
  const download = fileUploadService.getDownloadRoute({
    companyId: status.item?.company_id || '',
    fileId: status.details?.item.last_version_cache.file_metadata.external_id || '',
  });

  return { download, id, name, type, extension, size: status.details?.item.size };
};

async function getDirectoryPath(driveItem: DriveItem) {
  if (driveItem.parent_id === null) {
    // Base case: The item is in the root directory
    return '/' + driveItem.name;
  } else {
    // recursive
    const parentId = driveItem.parent_id;
    const parentItem = (await DriveApiClient.get(driveItem.company_id, parentId)).item;
    const parentPath: string = await getDirectoryPath(parentItem);
    return parentPath + '/' + driveItem.name;
  }
}
