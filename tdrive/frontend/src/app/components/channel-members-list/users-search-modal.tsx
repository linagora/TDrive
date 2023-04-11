import { Modal, ModalContent } from 'app/atoms/modal';
import { useUsersSearchModal } from 'app/features/channel-members-search/state/search-channel-member';
import Languages from 'app/features/global/services/languages-service';
import { ChannelMembersListModal } from './channel-members-modal';

export default () => {
  const { open, setOpen } = useUsersSearchModal();

  return (
    <Modal open={open} onClose={() => setOpen(false)} className="sm:w-[80vw] sm:max-w-xl">
      <ModalContent
        textCenter
        title={Languages.t('scenes.apps.parameters.workspace_sections.members')}
      >
        <ChannelMembersListModal />
      </ModalContent>
    </Modal>
  );
};
