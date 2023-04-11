import { Button } from 'app/atoms/button/button';
import { Modal, ModalContent } from 'app/atoms/modal';
import { Base } from 'app/atoms/text';
import { useDriveActions } from 'app/features/drive/hooks/use-drive-actions';
import { useDriveItem } from 'app/features/drive/hooks/use-drive-item';
import { DriveItemSelectedList } from 'app/features/drive/state/store';
import { DriveItem } from 'app/features/drive/types';
import { useEffect, useState } from 'react';
import { atom, useRecoilState } from 'recoil';

export type ConfirmTrashModalType = {
  open: boolean;
  items: DriveItem[];
};

export const ConfirmTrashModalAtom = atom<ConfirmTrashModalType>({
  key: 'ConfirmTrashModalAtom',
  default: {
    open: false,
    items: [],
  },
});

export const ConfirmTrashModal = () => {
  const [state, setState] = useRecoilState(ConfirmTrashModalAtom);

  return (
    <Modal open={state.open} onClose={() => setState({ ...state, open: false })}>
      {!!state.items.length && <ConfirmTrashModalContent items={state.items} />}
    </Modal>
  );
};

const ConfirmTrashModalContent = ({ items }: { items: DriveItem[] }) => {
  const { item, refresh } = useDriveItem(items[0].id);
  const { remove } = useDriveActions();
  const [loading, setLoading] = useState(false);
  const [state, setState] = useRecoilState(ConfirmTrashModalAtom);
  const [, setSelected] = useRecoilState(DriveItemSelectedList);

  useEffect(() => {
    refresh(items[0].id);
  }, []);

  return (
    <ModalContent
      title={
        items.length === 1 ? `Move ${item?.name} to trash` : `Move ${items.length} items to trash`
      }
    >
      <Base className="block my-3">
        Click 'Move to trash' to move the selected items to the trash folder. You can restore them
        later from the trash.
      </Base>
      <br />
      <Button
        className="float-right"
        loading={loading}
        onClick={async () => {
          setLoading(true);
          await Promise.all((items || []).map(async item => await remove(item.id, item.parent_id)));
          setSelected({});
          setLoading(false);
          refresh("trash");
          setState({ ...state, open: false });
        }}
      >
        Move to trash
      </Button>
    </ModalContent>
  );
};
