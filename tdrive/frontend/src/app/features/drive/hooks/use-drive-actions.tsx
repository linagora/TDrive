import { ToasterService } from '@features/global/services/toaster-service';
import useRouterCompany from '@features/router/hooks/use-router-company';
import { useCallback } from 'react';
import { useRecoilValue, useRecoilCallback } from 'recoil';
import { DriveApiClient } from '../api-client/api-client';
import { DriveItemAtom, DriveItemChildrenAtom, DriveQuotaStorage } from '../state/store';
import { BrowseFilter, DriveItem, DriveItemVersion } from '../types';
import { SharedWithMeFilterState } from '../state/shared-with-me-filter';
import Languages from "features/global/services/languages-service";
import { useCurrentUser } from 'app/features/users/hooks/use-current-user';

/**
 * Returns the children of a drive item
 * @param id
 * @returns
 */
export const useDriveActions = () => {
  const mainQuota = DriveQuotaStorage('main');
  const trashQuota = DriveQuotaStorage('trash');
  const { user } = useCurrentUser();
  const companyId = useRouterCompany();
  const sharedFilter = useRecoilValue(SharedWithMeFilterState);

  const refresh = useRecoilCallback(
    ({ set, snapshot }) =>
      async (parentId: string) => {
        if (parentId) {
          const filter:BrowseFilter = {
            company_id: companyId,
            mime_type: sharedFilter.mimeType.value,
          };
          try {
            const details = await DriveApiClient.browse(companyId, parentId, filter);
            set(DriveItemChildrenAtom(parentId), details.children);
            set(DriveItemAtom(parentId), details);
            for (const child of details.children) {
              const currentValue = snapshot.getLoadable(DriveItemAtom(child.id)).contents;
              if (!currentValue) {
                //only update if not already in cache to avoid concurrent updates
                set(DriveItemAtom(child.id), { item: child });
              }
            }
            return details;
          } catch (e) {
            ToasterService.error(Languages.t('hooks.use-drive-actions.unable_load_file'));
          }
        }
      },
    [companyId],
  );

  const create = useCallback(
    async (item: Partial<DriveItem>, version: Partial<DriveItemVersion>) => {
      const rootItem = await DriveApiClient.get(companyId, 'root');
      const myDriveItem = await DriveApiClient.get(companyId, 'user_' + user?.id);
      if (typeof item.size != 'undefined' && rootItem.item.size + item.size + myDriveItem.item.size <= mainQuota) {
        let driveFile = null;
        if (!item.company_id) item.company_id = companyId;
        try {
          driveFile = await DriveApiClient.create(companyId, { item, version });
          await refresh(item.parent_id!); 
        } catch (e) {
          ToasterService.error(Languages.t('hooks.use-drive-actions.unable_create_file'));
        }
        return driveFile;
      } else {
        ToasterService.error(Languages.t('hooks.use-drive-actions.unable_create_file'));
      }
    },
    [refresh],
  );

  const download = useCallback(
    async (id: string, versionId?: string) => {
      try {
        const url = await DriveApiClient.getDownloadUrl(companyId, id, versionId);
        (window as any).open(url, '_blank').focus();
      } catch (e) {
        ToasterService.error(Languages.t('hooks.use-drive-actions.unable_download_file'));
      }
    },
    [companyId],
  );

  const downloadZip = useCallback(
    async (ids: string[]) => {
      try {
        const url = await DriveApiClient.getDownloadZipUrl(companyId, ids);
        (window as any).open(url, '_blank').focus();
      } catch (e) {
        ToasterService.error(Languages.t('hooks.use-drive-actions.unable_download_file'));
      }
    },
    [companyId],
  );

  const remove = useCallback(
    async (id: string, parentId: string) => {
      const driveItem = await DriveApiClient.get(companyId, 'trash');
      try {
        const itemSize = (await DriveApiClient.get(companyId, id)).item.size
        if (typeof itemSize != 'undefined' && driveItem.item.size + itemSize <= trashQuota) {
          //ToasterService.error(Languages.t('Vous utilisez : ' + tstorageSize + ' octets de stockage'));
          await DriveApiClient.remove(companyId, id);
          await refresh(parentId || '');
        } else {
          ToasterService.error(Languages.t('hooks.use-drive-actions.unable_remove_file'));
        }
      } catch (e) {
        ToasterService.error(Languages.t('hooks.use-drive-actions.unable_remove_file'));
      }
    },
    [refresh],
  );

  const update = useCallback(
    async (update: Partial<DriveItem>, id: string, parentId: string) => {
      try {
        await DriveApiClient.update(companyId, id, update);
        await refresh(id || '');
        await refresh(parentId || '');
        if (update?.parent_id !== parentId) await refresh(update?.parent_id || '');
      } catch (e) {
        ToasterService.error(Languages.t('hooks.use-drive-actions.unable_update_file'));
      }
    },
    [refresh],
  );

  return { create, refresh, download, downloadZip, remove, update };
};
