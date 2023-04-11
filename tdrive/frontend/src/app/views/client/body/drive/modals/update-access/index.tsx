import { Modal, ModalContent } from 'app/atoms/modal';
import { useDriveItem } from 'app/features/drive/hooks/use-drive-item';
import { useEffect } from 'react';
import { atom, useRecoilState } from 'recoil';
import { InternalAccessManager } from './internal-access';
import { PublicLinkManager } from './public-link-access';

export type AccessModalType = {
  open: boolean;
  id: string;
};

export const AccessModalAtom = atom<AccessModalType>({
  key: 'AccessModalAtom',
  default: {
    open: false,
    id: '',
  },
});

export const AccessModal = () => {
  const [state, setState] = useRecoilState(AccessModalAtom);

  return (
    <Modal open={state.open} onClose={() => setState({ ...state, open: false })}>
      {!!state.id && <AccessModalContent id={state.id} />}
    </Modal>
  );
};

const AccessModalContent = ({ id }: { id: string }) => {
  const { item, access, refresh } = useDriveItem(id);

  useEffect(() => {
    refresh(id);
  }, []);

  console.log(item?.access_info?.public?.level, 'item');

  return (
    <ModalContent title={'Manage access to ' + item?.name}>
      <PublicLinkManager id={id} disabled={access !== 'manage'} />
      <InternalAccessManager id={id} disabled={access !== 'manage'} />
    </ModalContent>
  );
};
