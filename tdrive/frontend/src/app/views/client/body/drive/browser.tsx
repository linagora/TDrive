import { ChevronDownIcon, DotsHorizontalIcon } from '@heroicons/react/outline';
import { Button } from '@atoms/button/button';
import { Base, BaseSmall, Subtitle, Title } from '@atoms/text';
import Menu from '@components/menus/menu';
import { getFilesTree } from '@components/uploads/file-tree-utils';
import UploadZone from '@components/uploads/upload-zone';
import { setTdriveTabToken } from '@features/drive/api-client/api-client';
import { useDriveItem } from '@features/drive/hooks/use-drive-item';
import { DriveRealtimeObject } from '@features/drive/hooks/use-drive-realtime';
import { useDriveUpload } from '@features/drive/hooks/use-drive-upload';
import { DriveItemSelectedList } from '@features/drive/state/store';
import { formatBytes } from '@features/drive/utils';
import useRouterCompany from '@features/router/hooks/use-router-company';
import useRouterView from '@features/router/hooks/use-router-view';
import _ from 'lodash';
import { memo, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { atomFamily, useRecoilState, useSetRecoilState } from 'recoil';
import { DrivePreview } from '../../viewer/drive-preview';
import { useOnBuildContextMenu } from './context-menu';
import { DocumentRow } from './documents/document-row';
import { FolderRow } from './documents/folder-row';
import HeaderPath from './header-path';
import { ConfirmDeleteModal } from './modals/confirm-delete';
import { ConfirmTrashModal } from './modals/confirm-trash';
import { CreateModalAtom } from './modals/create';
import { PropertiesModal } from './modals/properties';
import { AccessModal } from './modals/update-access';
import { VersionsModal } from './modals/versions';
import { SharedFilesTable } from './shared-files-table';

export const DriveCurrentFolderAtom = atomFamily<
  string,
  { context?: string; initialFolderId: string }
>({
  key: 'DriveCurrentFolderAtom',
  default: options => options.initialFolderId || 'root',
});

export default memo(
  ({
    context,
    initialParentId,
    tdriveTabContextToken,
    inPublicSharing,
  }: {
    context?: string;
    initialParentId?: string;
    tdriveTabContextToken?: string;
    inPublicSharing?: boolean;
  }) => {
    const companyId = useRouterCompany();
    setTdriveTabToken(tdriveTabContextToken || null);

    const [parentId, _setParentId] = useRecoilState(
      DriveCurrentFolderAtom({ context: context, initialFolderId: initialParentId || 'root' }),
    );

    const [loadingParentChange, setLoadingParentChange] = useState(false);
    const {
      details,
      access,
      item,
      inTrash,
      refresh,
      children,
      loading: loadingParent,
      path,
    } = useDriveItem(parentId);
    const { uploadTree } = useDriveUpload();

    const loading = loadingParent || loadingParentChange;

    const uploadZone = 'drive_' + companyId;
    const uploadZoneRef = useRef<UploadZone | null>(null);

    const setCreationModalState = useSetRecoilState(CreateModalAtom);
    const [checked, setChecked] = useRecoilState(DriveItemSelectedList);

    const setParentId = useCallback(
      async (id: string) => {
        setLoadingParentChange(true);
        try {
          await refresh(id);
          _setParentId(id);
        } catch (e) {
          console.error(e);
        }
        setLoadingParentChange(false);
      },
      [_setParentId],
    );

    //In case we are kicked out of the current folder, we need to reset the parent id
    useEffect(() => {
      if (!loading && !path?.length && !inPublicSharing) setParentId('root');
    }, [path, loading, setParentId]);

    useEffect(() => {
      setChecked({});
      refresh(parentId);
      if (!inPublicSharing) refresh('trash');
    }, [parentId, refresh]);

    const openItemModal = useCallback(() => {
      if (item?.id) setCreationModalState({ open: true, parent_id: item.id });
    }, [item?.id, setCreationModalState]);

    const selectedCount = Object.values(checked).filter(v => v).length;
    const folders = children
      .filter(i => i.is_directory)
      .sort((a, b) => a.name.localeCompare(b.name));
    const documents = (
      item?.is_directory === false
        ? //We use this hack for public shared single file
          item
          ? [item]
          : []
        : children
    )
      .filter(i => !i.is_directory)
      .sort((a, b) => a.name.localeCompare(b.name));

    const onBuildContextMenu = useOnBuildContextMenu(children, initialParentId);
    const viewId = useRouterView();
    return (
      <>
        {viewId == 'shared-with-me' ? (
          <>
            <SharedFilesTable items={documents} />
          </>
        ) : (
          <UploadZone
            overClassName={''}
            className="h-full overflow-hidden"
            disableClick
            parent={''}
            multiple={true}
            allowPaste={true}
            ref={uploadZoneRef}
            driveCollectionKey={uploadZone}
            onAddFiles={async (_, event) => {
              const tree = await getFilesTree(event);
              setCreationModalState({ parent_id: '', open: false });
              uploadTree(tree, {
                companyId,
                parentId,
              });
            }}
          >
            <DriveRealtimeObject id={parentId} key={parentId} />
            <VersionsModal />
            <AccessModal />
            <PropertiesModal />
            <ConfirmDeleteModal />
            <ConfirmTrashModal />
            <Suspense fallback={<></>}>
              <DrivePreview />
            </Suspense>
            <div
              className={
                'flex flex-col grow h-full overflow-hidden ' +
                (loading && (!children?.length || loadingParentChange) ? 'opacity-50 ' : '')
              }
            >
              <div className="flex flex-row shrink-0 items-center mb-4">
                <HeaderPath path={path || []} inTrash={inTrash} setParentId={setParentId} />
                <div className="grow" />

                {access !== 'read' && (
                  <BaseSmall>{formatBytes(item?.size || 0)} used in this folder</BaseSmall>
                )}
                <Menu menu={() => onBuildContextMenu(details)}>
                  {' '}
                  <Button theme="secondary" className="ml-4 flex flex-row items-center">
                    <span>{selectedCount > 1 ? `${selectedCount} items` : 'More'} </span>

                    <ChevronDownIcon className="h-4 w-4 ml-2 -mr-1" />
                  </Button>
                </Menu>
              </div>

              <div className="grow overflow-auto">
                {folders.length > 0 && (
                  <>
                    <Title className="mb-2 block">Folders</Title>

                    {folders.map((child, index) => (
                      <FolderRow
                        key={index}
                        className={
                          (index === 0 ? 'rounded-t-md ' : '') +
                          (index === folders.length - 1 ? 'rounded-b-md ' : '')
                        }
                        item={child}
                        onClick={() => {
                          return setParentId(child.id);
                        }}
                        checked={checked[child.id] || false}
                        onCheck={v =>
                          setChecked(_.pickBy({ ...checked, [child.id]: v }, _.identity))
                        }
                        onBuildContextMenu={() => onBuildContextMenu(details, child)}
                      />
                    ))}
                    <div className="my-6" />
                  </>
                )}

                <Title className="mb-2 block">Documents</Title>

                {documents.length === 0 && !loading && (
                  <div className="mt-4 text-center border-2 border-dashed rounded-md p-8">
                    <Subtitle className="block mb-2">Nothing here.</Subtitle>
                    {!inTrash && access != 'read' && (
                      <>
                        <Base>
                          Drag and drop files to upload them or click on the 'Add document' button.
                        </Base>
                        <br />
                        <Button onClick={() => openItemModal()} theme="primary" className="mt-4">
                          Add document or folder
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {documents.map((child, index) => (
                  <DocumentRow
                    key={index}
                    className={
                      (index === 0 ? 'rounded-t-md ' : '') +
                      (index === documents.length - 1 ? 'rounded-b-md ' : '')
                    }
                    item={child}
                    checked={checked[child.id] || false}
                    onCheck={v => setChecked(_.pickBy({ ...checked, [child.id]: v }, _.identity))}
                    onBuildContextMenu={() => onBuildContextMenu(details, child)}
                  />
                ))}
              </div>
            </div>
          </UploadZone>
        )}
      </>
    );
  },
);
