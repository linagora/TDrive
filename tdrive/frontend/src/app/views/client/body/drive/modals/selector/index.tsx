import { DocumentIcon, FolderIcon } from '@heroicons/react/solid';
import { Button } from 'app/atoms/button/button';
import { Checkbox } from 'app/atoms/input/input-checkbox';
import { Modal, ModalContent } from 'app/atoms/modal';
import { useDriveItem } from 'app/features/drive/hooks/use-drive-item';
import { DriveItem } from 'app/features/drive/types';
import { useEffect, useState } from 'react';
import { atom, useRecoilState } from 'recoil';
import { PathRender } from '../../header-path';

export type SelectorModalType = {
  open: boolean;
  parent_id: string;
  mode: 'move' | 'select-file' | 'select-files';
  title: string;
  onSelected: (ids: string[]) => Promise<void>;
};

export const SelectorModalAtom = atom<SelectorModalType>({
  key: 'SelectorModalAtom',
  default: {
    open: false,
    parent_id: '',
    mode: 'move',
    title: '',
    onSelected: async () => {},
  },
});

export const SelectorModal = () => {
  const [state, setState] = useRecoilState(SelectorModalAtom);

  return (
    <Modal open={state.open} onClose={() => setState({ ...state, open: false })}>
      <SelectorModalContent key={state.parent_id} />
    </Modal>
  );
};

const SelectorModalContent = () => {
  const [state, setState] = useRecoilState(SelectorModalAtom);
  const [selected, setSelected] = useState<DriveItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [parentId, setParentId] = useState(state.parent_id);

  const { children, path, item: parent, refresh } = useDriveItem(parentId);

  useEffect(() => {
    if (state.mode === 'select-file' && parent) setSelected([]);
    if (state.mode === 'move' && parent) setSelected([parent]);
    refresh(parentId);
  }, [parentId, parent?.id]);

  const folders = (children?.filter(i => i.is_directory) || []).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const files = (children?.filter(i => !i.is_directory) || []).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <ModalContent title={state.title}>
      <PathRender
        path={path || []}
        inTrash={false}
        onClick={(id: string) => {
          setParentId(id);
        }}
      />

      <div
        className="border border-gray-300 rounded-md mb-4 mt-2 overflow-auto"
        style={{ height: '30vh' }}
      >
        {folders.map(folder => (
          <div
            key={folder.id}
            className={
              'flex flex-row items-center border-t -mt-px px-4 py-2 cursor-pointer ' +
              'hover:bg-zinc-500 hover:bg-opacity-10 '
            }
            onClick={() => {
              setParentId(folder.id);
            }}
          >
            <div className="grow flex flex-row items-center">
              <FolderIcon className="h-5 w-5 shrink-0 text-blue-500 mr-2" />
              {folder.name}
            </div>
          </div>
        ))}
        {files.map(file => (
          <div
            key={file.id}
            className={
              'flex flex-row items-center border-t -mt-px px-4 py-2 cursor-pointer ' +
              'hover:bg-zinc-500 hover:bg-opacity-10 '
            }
            onClick={() => {
              if (state.mode === 'select-files') {
                if (!selected.some(i => i.id === file.id)) {
                  setSelected([...selected, file]);
                } else {
                  setSelected(selected.filter(i => i.id !== file.id));
                }
              } else if (state.mode === 'select-file') {
                setSelected([file]);
              }
            }}
          >
            <div className="grow flex flex-row items-center">
              <DocumentIcon className="h-5 w-5 shrink-0 text-gray-400 mr-2" />
              {file.name}
            </div>
            {(state.mode === 'select-file' || state.mode === 'select-files') && (
              <div className="shrink-0" onClick={e => e.stopPropagation()}>
                <Checkbox value={selected.some(i => i.id === file.id)} />
              </div>
            )}
          </div>
        ))}
      </div>

      <Button
        disabled={selected.length === 0}
        loading={loading}
        theme="primary"
        className="float-right"
        onClick={async () => {
          setLoading(true);
          await state.onSelected(selected.map(i => i.id));
          setState({ ...state, open: false });
          setLoading(false);
        }}
      >
        {selected.length === 0 ? (
          <>No item selected</>
        ) : state.mode === 'move' ? (
          <>Move to '{selected[0]?.name}'</>
        ) : selected.length > 1 ? (
          <>Select {selected.length} files</>
        ) : (
          <>Select '{selected[0]?.name}'</>
        )}
      </Button>
    </ModalContent>
  );
};
