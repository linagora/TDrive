import { Button } from 'app/atoms/button/button';
import { InputLabel } from 'app/atoms/input/input-decoration-label';
import { Input } from 'app/atoms/input/input-text';
import { Modal, ModalContent } from 'app/atoms/modal';
import { useDriveActions } from 'app/features/drive/hooks/use-drive-actions';
import { useDriveItem } from 'app/features/drive/hooks/use-drive-item';
import { useEffect, useState } from 'react';
import { atom, useRecoilState } from 'recoil';

export type PropertiesModalType = {
  open: boolean;
  id: string;
};

export const PropertiesModalAtom = atom<PropertiesModalType>({
  key: 'PropertiesModalAtom',
  default: {
    open: false,
    id: '',
  },
});

export const PropertiesModal = () => {
  const [state, setState] = useRecoilState(PropertiesModalAtom);

  return (
    <Modal open={state.open} onClose={() => setState({ ...state, open: false })}>
      {!!state.id && (
        <PropertiesModalContent id={state.id} onClose={() => setState({ ...state, open: false })} />
      )}
    </Modal>
  );
};

const PropertiesModalContent = ({ id, onClose }: { id: string; onClose: () => void }) => {
  const { item, refresh } = useDriveItem(id);
  const { update } = useDriveActions();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    refresh(id);
  }, []);

  useEffect(() => {
    if (!name) setName(item?.name || '');
  }, [item?.name]);

  return (
    <ModalContent title={'Rename ' + item?.name}>
      <InputLabel
        className="mt-4"
        label={'Name'}
        input={
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Document or folder name"
          />
        }
      />
      <br />
      <Button
        disabled={!name}
        className="float-right mt-4"
        theme="primary"
        loading={loading}
        onClick={async () => {
          setLoading(true);
          if (item) {
            let finalName = name;
            if (!item?.is_directory) {
              const ext = item?.name.split('.').pop();
              finalName = name.split('.')[0] + (ext !== item?.name ? '.' + ext : '');
            }
            await update({ name: finalName }, id, item.parent_id);
          }
          onClose();
          setLoading(false);
        }}
      >
        Update name
      </Button>
    </ModalContent>
  );
};
