import { ToasterService } from 'app/features/global/services/toaster-service';
import useRouterCompany from 'app/features/router/hooks/use-router-company';
import { useCallback } from 'react';
import { useRecoilCallback } from 'recoil';
import { DriveApiClient } from '../api-client/api-client';
import { DriveItemAtom, DriveItemChildrenAtom } from '../state/store';
import { DriveItem, DriveItemVersion } from '../types';

/**
 * Returns the children of a drive item
 * @param id
 * @returns
 */
export const useDriveActions = () => {
  const companyId = useRouterCompany();

  const refresh = useRecoilCallback(
    ({ set, snapshot }) =>
      async (parentId: string) => {
        if (parentId) {
          try {
            const details = await DriveApiClient.get(companyId, parentId);
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
            ToasterService.error('Unable to load your files.');
          }
        }
      },
    [companyId],
  );

  const create = useCallback(
    async (item: Partial<DriveItem>, version: Partial<DriveItemVersion>) => {
      let driveFile = null;
      if (!item.company_id) item.company_id = companyId;
      try {
        driveFile = await DriveApiClient.create(companyId, { item, version });
        await refresh(item.parent_id!);
      } catch (e) {
        ToasterService.error('Unable to create a new file.');
      }
      return driveFile;
    },
    [refresh],
  );

  const download = useCallback(
    async (id: string, versionId?: string) => {
      try {
        const url = await DriveApiClient.getDownloadUrl(companyId, id, versionId);
        (window as any).open(url, '_blank').focus();
      } catch (e) {
        ToasterService.error('Unable to download this file.');
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
        ToasterService.error('Unable to download this files.');
      }
    },
    [companyId],
  );

  const remove = useCallback(
    async (id: string, parentId: string) => {
      try {
        await DriveApiClient.remove(companyId, id);
        await refresh(parentId || '');
      } catch (e) {
        ToasterService.error('Unable to remove this file.');
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
        ToasterService.error('Unable to update this file.');
      }
    },
    [refresh],
  );

  return { create, refresh, download, downloadZip, remove, update };
};
