import React from 'react';
import { Button } from 'app/atoms/button/button';
import { Modal, ModalContent } from 'app/atoms/modal';
import { ChannelSelector } from 'app/components/channels-selector';
import { ChannelType } from 'app/features/channels/types/channel';
import { useInvitationChannels } from 'app/features/invitation/hooks/use-invitation-channels';
import { uniqBy } from 'lodash';
import Languages from 'app/features/global/services/languages-service';

export default (): React.ReactElement => {
  const { selectedChannels, closeSelection, setChannels, open } = useInvitationChannels();

  const handleSelectionChange = (channels: ChannelType[]) => {
    setChannels(uniqBy(channels, 'id'));
  };

  return (
    <Modal open={open} onClose={() => closeSelection()} className="sm:w-[20vw] sm:max-w-xl">
      <ModalContent textCenter title="Choose channels">
        <ChannelSelector
          initialChannels={selectedChannels}
          onChange={handleSelectionChange}
          lockDefaultChannels={true}
        />

        <Button
          theme="primary"
          disabled={!selectedChannels.length}
          onClick={() => closeSelection()}
          className="w-full justify-center"
        >
          {Languages.t(
            'components.invitation.invitation_channels.button',
            [],
            'Invite to channels',
          )}
          <div className="font-medium h-5 px-1.5 flex items-center justify-center text-sm rounded-full ml-1 bg-white text-blue-500">
            {selectedChannels.length}
          </div>
        </Button>
      </ModalContent>
    </Modal>
  );
};
