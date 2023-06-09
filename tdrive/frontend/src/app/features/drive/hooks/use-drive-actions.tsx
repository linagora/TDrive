import { ToasterService } from '@features/global/services/toaster-service';
import useRouterCompany from '@features/router/hooks/use-router-company';
import { useCallback } from 'react';
import { useRecoilCallback } from 'recoil';
import { DriveApiClient } from '../api-client/api-client';
import { DriveItemAtom, DriveItemChildrenAtom } from '../state/store';
import { DriveItem, DriveItemDetails, DriveItemVersion } from '../types';

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
          console.log("parent id is: ", parentId);
          if (parentId == "shared-with-me") {
            const details = {
              path: [
                  {
                      id: "shared-with-me",
                      name: "Shared with me"
                  }
              ],
              item: {
                  id: "root",
                  parent_id: "",
                  company_id: "",
                  workspace_id: "",
                  name: "Shared with me",
                  size: 0,
                  description: "",
                  tags: [],
                  in_trash: false,
                  is_directory: true,
                  extension: "",
                  added: "",
                  last_modified: "",
                  last_version_cache: {},
                  access_info: {},
              },
              versions: [],
              children: [],
              access: "manage",
              websockets: [
                  {
                      room: "/companies/aa7ffdd0-fadb-11ed-b891-510fe3501b2b/documents/item/root",
                      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhYTU0Y2YyMC1mYWRiLTExZWQtYjg5MS01MTBmZTM1MDFiMmIiLCJuYW1lIjoiL2NvbXBhbmllcy9hYTdmZmRkMC1mYWRiLTExZWQtYjg5MS01MTBmZTM1MDFiMmIvZG9jdW1lbnRzL2l0ZW0vcm9vdCIsImlhdCI6MTY4ODk1MDk2OCwibmJmIjoxNjg2MjcyNTA4fQ.H6BFRcLG3Op32sqKi45Pf1s2YKcVbMxGZGPJal06l1g"
                  }
              ]
            };
            set(DriveItemChildrenAtom(parentId), details.children);
            return details;
          } else {
            try {
              const details = await DriveApiClient.get(companyId, parentId);
              console.log("details are: ", details);
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
