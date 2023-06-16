import { useState, useCallback } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { DriveCurrentFolderAtom } from './browser';
import { ConfirmDeleteModalAtom } from './modals/confirm-delete';
import { ConfirmTrashModalAtom } from './modals/confirm-trash';
import { CreateModalAtom } from './modals/create';
import { PropertiesModalAtom } from './modals/properties';
import { SelectorModalAtom } from './modals/selector';
import { AccessModalAtom } from './modals/update-access';
import { VersionsModalAtom } from './modals/versions';
import { DriveApiClient, getPublicLinkToken } from '@features/drive/api-client/api-client';
import { useDriveActions } from '@features/drive/hooks/use-drive-actions';
import { getPublicLink } from '@features/drive/hooks/use-drive-item';
import { useDrivePreview } from '@features/drive/hooks/use-drive-preview';
import { DriveItemSelectedList } from '@features/drive/state/store';
import { DriveItem, DriveItemDetails } from '@features/drive/types';
import { ToasterService } from '@features/global/services/toaster-service';
import { copyToClipboard } from '@features/global/utils/CopyClipboard';
import { SharedWithMeFilterState } from '@features/drive/state/shared-with-me-filter';
import { getCurrentUserList, getUser } from '@features/users/hooks/use-user-list';
import _ from 'lodash';
import Languages from 'features/global/services/languages-service';

/**
 * This will build the context menu in different contexts
 */
export const useOnBuildContextMenu = (children: DriveItem[], initialParentId?: string) => {
  const [checkedIds, setChecked] = useRecoilState(DriveItemSelectedList);
  const checked = children.filter(c => checkedIds[c.id]);

  const [_, setParentId] = useRecoilState(
    DriveCurrentFolderAtom({ initialFolderId: initialParentId || 'root' }),
  );

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
              text: Languages.t('components.item_context_menu.preview'),
              hide: item.is_directory,
              onClick: () => preview(item),
            },
            {
              type: 'menu',
              text: Languages.t('components.item_context_menu.download'),
              onClick: () => download(item.id),
            },
            { type: 'separator' },
            {
              type: 'menu',
              text: Languages.t('components.item_context_menu.rename'),
              hide: access === 'read',
              onClick: () => setPropertiesModalState({ open: true, id: item.id }),
            },
            {
              type: 'menu',
              text: Languages.t('components.item_context_menu.manage_access'),
              hide: access === 'read' || getPublicLinkToken(),
              onClick: () => setAccessModalState({ open: true, id: item.id }),
            },
            {
              type: 'menu',
              text: Languages.t('components.item_context_menu.share'),
              hide: access === 'read' || getPublicLinkToken(),
              onClick: () => setAccessModalState({ open: true, id: item.id }),
            },
            {
              type: 'menu',
              text: Languages.t('components.item_context_menu.copy_link'),
              hide: !item.access_info.public?.level || item.access_info.public?.level === 'none',
              onClick: () => {
                copyToClipboard(getPublicLink(item || parent?.item));
                ToasterService.success(
                  Languages.t('components.item_context_menu.copy_link.success'),
                );
              },
            },
            {
              type: 'menu',
              text: Languages.t('components.item_context_menu.versions'),
              hide: item.is_directory,
              onClick: () => setVersionModal({ open: true, id: item.id }),
            },
            {
              type: 'menu',
              text: Languages.t('components.item_context_menu.move'),
              hide: access === 'read',
              onClick: () =>
                setSelectorModalState({
                  open: true,
                  parent_id: inTrash ? 'root' : item.parent_id,
                  mode: 'move',
                  title:
                    Languages.t('components.item_context_menu.move.modal_header') +
                    ` '${item.name}'`,
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
              text: Languages.t('components.item_context_menu.move_to_trash'),
              className: 'error',
              hide: inTrash || access !== 'manage',
              onClick: () => setConfirmTrashModalState({ open: true, items: [item] }),
            },
            {
              type: 'menu',
              text: Languages.t('components.item_context_menu.delete'),
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
              text: Languages.t('components.item_context_menu.move_multiple'),
              hide: parent.access === 'read',
              onClick: () =>
                setSelectorModalState({
                  open: true,
                  parent_id: inTrash ? 'root' : parent.item!.id,
                  title: Languages.t('components.item_context_menu.move_multiple.modal_header'),
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
              text: Languages.t('components.item_context_menu.download_multiple'),
              onClick: () =>
                selectedCount === 1 ? download(checked[0].id) : downloadZip(checked.map(c => c.id)),
            },
            {
              type: 'menu',
              text: Languages.t('components.item_context_menu.clear_selection'),
              onClick: () => setChecked({}),
            },
            { type: 'separator', hide: parent.access === 'read' },
            {
              type: 'menu',
              text: Languages.t('components.item_context_menu.delete_multiple'),
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
              text: Languages.t('components.item_context_menu.to_trash_multiple'),
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
                  text: Languages.t('components.item_context_menu.trash.exit'),
                  onClick: () => setParentId('root'),
                },
                { type: 'separator' },
                {
                  type: 'menu',
                  text: Languages.t('components.item_context_menu.trash.empty'),
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
                  text: Languages.t('components.item_context_menu.add_documents'),
                  hide: inTrash || parent.access === 'read',
                  onClick: () =>
                    parent?.item?.id &&
                    setCreationModalState({ open: true, parent_id: parent?.item?.id }),
                },
                {
                  type: 'menu',
                  text: Languages.t('components.item_context_menu.download_folder'),
                  hide: inTrash,
                  onClick: () => downloadZip([parent.item!.id]),
                },
                {
                  type: 'menu',
                  text: Languages.t('components.item_context_menu.copy_link'),
                  hide:
                    !parent?.item?.access_info?.public?.level ||
                    parent?.item?.access_info?.public?.level === 'none',
                  onClick: () => {
                    copyToClipboard(getPublicLink(item || parent?.item));
                    ToasterService.success(
                      Languages.t('components.item_context_menu.copy_link.success'),
                    );
                  },
                },
                { type: 'separator', hide: inTrash || parent.access === 'read' },
                {
                  type: 'menu',
                  text: Languages.t('components.item_context_menu.go_to_trash'),
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

export const useOnBuildFileTypeContextMenu = () => {
  const [filter, setFilter] = useRecoilState(SharedWithMeFilterState);
  const mimeTypes = [
    { key: 'All', value: '' },
    { key: 'PDF', value: 'application/pdf' },
    { key: 'DOC', value: 'application/msword' },
    { key: 'PNG', value: 'image/png' },
  ];
  return useCallback(() => {
    const menuItems = mimeTypes.map(item => {
      return {
        type: 'menu',
        text: item.key,
        onClick: () => {
          setFilter(prevFilter => {
            const newFilter = {
              ...prevFilter,
              mimeType: item.value,
            };
            return newFilter;
          });
        },
      };
    });
    return menuItems;
  }, [setFilter]);
};

export const useOnBuildPeopleContextMenu = () => {
  const [filter, setFilter] = useRecoilState(SharedWithMeFilterState);
  const [_userList, setUserList] = useState(getCurrentUserList());
  let userList = _userList;
  userList = _.uniqBy(userList, 'id');
  return useCallback(() => {
    const menuItems = userList.map(user => {
      return {
        type: 'menu',
        text: user.first_name,
        onClick: () => {
          setFilter(prevFilter => {
            const newFilter = {
              ...prevFilter,
              creator: user.id ?? '',
            };
            return newFilter;
          });
        },
      };
    });
    return menuItems;
  }, [setFilter]);
};

export const useOnBuildDateContextMenu = () => {
  const [filter, setFilter] = useRecoilState(SharedWithMeFilterState);
  return useCallback(() => {
    const menuItems = [
      {
        type: 'menu',
        text: 'All',
        onClick: () => {
          setFilter(prevFilter => {
            const newFilter = {
              ...prevFilter,
              date: '',
            };
            return newFilter;
          });
        },
      },
      {
        type: 'menu',
        text: 'Today',
        onClick: () => {
          setFilter(prevFilter => {
            const newFilter = {
              ...prevFilter,
              date: 'today',
            };
            return newFilter;
          });
        },
      },
      {
        type: 'menu',
        text: 'Last week',
        onClick: () => {
          setFilter(prevFilter => {
            const newFilter = {
              ...prevFilter,
              date: 'last_week',
            };
            return newFilter;
          });
        },
      },
      {
        type: 'menu',
        text: 'Last month',
        onClick: () => {
          setFilter(prevFilter => {
            const newFilter = {
              ...prevFilter,
              date: 'last_month',
            };
            return newFilter;
          });
        },
      },
    ];
    return menuItems;
  }, [setFilter]);
};
export const useOnBuildFileContextMenu = () => {
  const { download } = useDriveActions();
  const { open: preview } = useDrivePreview();
  return useCallback(
    (item: DriveItem) => {
      const menuItems = [
        {
          type: 'menu',
          text: 'Preview',
          onClick: () => preview(item),
        },
        {
          type: 'menu',
          text: 'Download',
          onClick: () => download(item.id),
        },
      ];
      return menuItems;
    },
    [download, preview],
  );
};
