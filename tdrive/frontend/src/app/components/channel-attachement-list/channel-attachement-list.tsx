import { Modal, ModalContent } from 'app/atoms/modal';
import {
  channelAttachmentListState,
  activeChannelAttachementListTabState,
} from 'app/features/channels/state/channel-attachment-list';
import Languages from 'app/features/global/services/languages-service';
import Tab from 'app/molecules/tabs';
import React from 'react';
import { useRecoilState } from 'recoil';
import ChannelFiles from './parts/channel-files';
import ChannelMedias from './parts/channel-medias';

enum Tabs {
  Medias = 0,
  Files = 1,
}

export default (): React.ReactElement => {
  const [open, setOpen] = useRecoilState(channelAttachmentListState);
  const [activeTab, setActiveTab] = useRecoilState(activeChannelAttachementListTabState);

  return (
    <Modal open={open} onClose={() => setOpen(false)} className="sm:w-[60vw] sm:max-w-2xl">
      <ModalContent textCenter title={Languages.t('components.channel_attachement_list.title')}>
        <Tab
          tabs={[
            <div key="media">
              <div className="flex">
                {Languages.t('components.channel_attachement_list.medias')}
              </div>
            </div>,
            <div key="files">
              <div className="flex">{Languages.t('components.channel_attachement_list.files')}</div>
            </div>,
          ]}
          selected={activeTab}
          onClick={index => setActiveTab(index)}
        />
        {activeTab === Tabs.Medias && <ChannelMedias />}
        {activeTab === Tabs.Files && <ChannelFiles />}
      </ModalContent>
    </Modal>
  );
};
