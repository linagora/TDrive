import { DriveApiClient } from 'app/features/drive/api-client/api-client';
import { useDriveActions } from 'app/features/drive/hooks/use-drive-actions';
import { getPublicLink } from 'app/features/drive/hooks/use-drive-item';
import { useDrivePreview } from 'app/features/drive/hooks/use-drive-preview';
import { DriveItemSelectedList } from 'app/features/drive/state/store';
import { DriveItem, DriveItemDetails } from 'app/features/drive/types';
import { ToasterService } from 'app/features/global/services/toaster-service';
import { copyToClipboard } from 'app/features/global/utils/CopyClipboard';
import { useCallback } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { DriveCurrentFolderAtom } from './browser';
import { ConfirmDeleteModalAtom } from './modals/confirm-delete';
import { ConfirmTrashModalAtom } from './modals/confirm-trash';
import { CreateModalAtom } from './modals/create';
import { PropertiesModalAtom } from './modals/properties';
import { SelectorModalAtom } from './modals/selector';
import { AccessModalAtom } from './modals/update-access';
import { VersionsModalAtom } from './modals/versions';

/**
 * This will build the context menu in different contexts
 */
export const useOnBuildContextMenu = (children: DriveItem[], initialParentId?: string) => {
  const [checkedIds, setChecked] = useRecoilState(DriveItemSelectedList);
  const checked = children.filter(c => checkedIds[c.id]);

  const [_, setParentId] = useRecoilState(DriveCurrentFolderAtom(initialParentId || 'root'));

  const { download, downloadZip, update } = useDriveActions();
  const setCreationModalState = useSetRecoilState(CreateModalAtom);
  const setSelectorModalState = useSetRecoilState(SelectorModalAtom);
  const setConfirmDeleteModalState = useSetRecoilState(ConfirmDeleteModalAtom);
  const setConfirmTrashModalState = useSetRecoilState(ConfirmTrashModalAtom);
  const setVersionModal = useSetRecoilState(VersionsModalAtom);
  const setAccessModalState = useSetRecoilState(AccessModalAtom);
  const setPropertiesModalState = useSetRecoilState(PropertiesModalAtom);
  const { open: preview } = useDrivePreview();

  return useCallback(
    async (parent?: Partial<DriveItemDetails> | null, item?: DriveItem) => {
      if (!parent || !parent.item || !parent.access) return [];

      try {
        const inTrash = parent.path?.[0]?.id === 'trash';
        const selectedCount = checked.length;

        let menu: any[] = [];

        if (item && selectedCount < 2) {
          //Add item related menus
          const upToDateItem = await DriveApiClient.get(item.company_id, item.id);
          const access = upToDateItem.access || 'none';
          const newMenuActions = [
            {
              type: 'menu',
              text: 'Preview',
              hide: item.is_directory,
              onClick: () => preview(item),
            },
            {
              type: 'menu',
              text: 'Download',
              onClick: () => download(item.id),
            },
            { type: 'separator' },
            {
              type: 'menu',
              text: 'Rename',
              hide: access === 'read',
              onClick: () => setPropertiesModalState({ open: true, id: item.id }),
            },
            {
              type: 'menu',
              text: 'Manage access',
              hide: access === 'read',
              onClick: () => setAccessModalState({ open: true, id: item.id }),
            },
            {
              type: 'menu',
              text: 'Copy public link',
              hide: !item.access_info.public?.level || item.access_info.public?.level === 'none',
              onClick: () => {
                copyToClipboard(getPublicLink(item));
                ToasterService.success('Public link copied to clipboard');
              },
            },
            {
              type: 'menu',
              text: 'Versions',
              hide: item.is_directory,
              onClick: () => setVersionModal({ open: true, id: item.id }),
            },
            {
              type: 'menu',
              text: 'Move',
              hide: access === 'read',
              onClick: () =>
                setSelectorModalState({
                  open: true,
                  parent_id: inTrash ? 'root' : item.parent_id,
                  mode: 'move',
                  title: `Move '${item.name}'`,
                  onSelected: async ids => {
                    await update(
                      {
                        parent_id: ids[0],
                      },
                      item.id,
                      item.parent_id,
                    );
                  },
                }),
            },
            { type: 'separator', hide: access !== 'manage' },
            {
              type: 'menu',
              text: 'Move to trash',
              className: 'error',
              hide: inTrash || access !== 'manage',
              onClick: () => setConfirmTrashModalState({ open: true, items: [item] }),
            },
            {
              type: 'menu',
              text: 'Delete',
              className: 'error',
              hide: !inTrash || access !== 'manage',
              onClick: () => setConfirmDeleteModalState({ open: true, items: [item] }),
            },
          ];
          if (newMenuActions.filter(a => !a.hide).length) {
            menu = [...newMenuActions];
          }
        }

        if (selectedCount && (selectedCount >= 2 || !item)) {
          // Add selected items related menus
          const newMenuActions: any[] = [
            {
              type: 'menu',
              text: 'Move ' + selectedCount + ' items',
              hide: parent.access === 'read',
              onClick: () =>
                setSelectorModalState({
                  open: true,
                  parent_id: inTrash ? 'root' : parent.item!.id,
                  title: 'Move ' + selectedCount + ' items',
                  mode: 'move',
                  onSelected: async ids => {
                    for (const item of checked) {
                      await update(
                        {
                          parent_id: ids[0],
                        },
                        item.id,
                        item.parent_id,
                      );
                    }
                    setChecked({});
                  },
                }),
            },
            {
              type: 'menu',
              text: 'Download ' + selectedCount + ' items',
              onClick: () =>
                selectedCount === 1 ? download(checked[0].id) : downloadZip(checked.map(c => c.id)),
            },
            {
              type: 'menu',
              text: 'Clear selection',
              onClick: () => setChecked({}),
            },
            { type: 'separator', hide: parent.access === 'read' },
            {
              type: 'menu',
              text: 'Delete ' + selectedCount + ' items',
              hide: !inTrash || parent.access !== 'manage',
              className: 'error',
              onClick: () => {
                setConfirmDeleteModalState({
                  open: true,
                  items: checked,
                });
              },
            },
            {
              type: 'menu',
              text: 'Move ' + selectedCount + ' items to trash',
              hide: inTrash || parent.access !== 'manage',
              className: 'error',
              onClick: async () =>
                setConfirmTrashModalState({
                  open: true,
                  items: checked,
                }),
            },
          ];
          if (menu.length && newMenuActions.filter(a => !a.hide).length) {
            menu = [...menu, { type: 'separator' }];
          }
          menu = [...menu, ...newMenuActions];
        } else if (!item) {
          //Add parent related menus
          const newMenuActions: any[] = inTrash
            ? [
                {
                  type: 'menu',
                  text: 'Exit trash',
                  onClick: () => setParentId('root'),
                },
                { type: 'separator' },
                {
                  type: 'menu',
                  text: 'Empty trash',
                  className: 'error',
                  hide: parent.item!.id != 'trash' || parent.access !== 'manage',
                  onClick: () => {
                    setConfirmDeleteModalState({
                      open: true,
                      items: children, //Fixme: Here it works because this menu is displayed only in the trash root folder
                    });
                  },
                },
              ]
            : [
                {
                  type: 'menu',
                  text: 'Add document or folder',
                  hide: inTrash || parent.access === 'read',
                  onClick: () =>
                    parent?.item?.id &&
                    setCreationModalState({ open: true, parent_id: parent?.item?.id }),
                },
                {
                  type: 'menu',
                  text: 'Download folder',
                  hide: inTrash,
                  onClick: () => downloadZip([parent.item!.id]),
                },
                {
                  type: 'menu',
                  text: 'Copy public link',
                  hide:
                    !parent?.item?.access_info?.public?.level ||
                    parent?.item?.access_info?.public?.level === 'none',
                  onClick: () => {
                    copyToClipboard(getPublicLink(item));
                    ToasterService.success('Public link copied to clipboard');
                  },
                },
                { type: 'separator', hide: inTrash || parent.access === 'read' },
                {
                  type: 'menu',
                  text: 'Go to trash',
                  hide: inTrash || parent.access === 'read',
                  onClick: () => setParentId('trash'),
                },
              ];
          if (menu.length && newMenuActions.filter(a => !a.hide).length) {
            menu = [...menu, { type: 'separator' }];
          }
          menu = [...menu, ...newMenuActions];
        }

        return menu;
      } catch (e) {
        console.error(e);
        ToasterService.error('An error occurred');
      }
      return [];
    },
    [
      checked,
      setChecked,
      setSelectorModalState,
      setConfirmDeleteModalState,
      setConfirmTrashModalState,
      download,
      downloadZip,
      update,
      preview,
      setParentId,
      setCreationModalState,
      setVersionModal,
      setAccessModalState,
      setPropertiesModalState,
    ],
  );
};
