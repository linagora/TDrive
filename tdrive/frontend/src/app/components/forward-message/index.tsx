import { Button } from 'app/atoms/button/button';
import { Input } from 'app/atoms/input/input-text';
import { Modal, ModalContent } from 'app/atoms/modal';
import { ToasterService } from 'app/features/global/services/toaster-service';
import { useState } from 'react';
import { atom, useRecoilState } from 'recoil';
import { ChannelSelector } from '../channels-selector';
import MessageThreadAPIClient from 'features/messages/api/message-thread-api-client';
import { ChannelType } from 'app/features/channels/types/channel';
import { NodeMessage } from 'app/features/messages/types/message';
import Login from 'app/features/auth/login-service';
import { v1 as uuidv1 } from 'uuid';
import Languages from '../../features/global/services/languages-service';

export const ForwardMessageAtom = atom<null | {
  id: string;
  thread_id: string;
  channel_id: string;
  workspace_id: string;
  company_id: string;
}>({
  key: 'ForwardMessageAtom',
  default: null,
});

export const ForwardMessageModal = () => {
  const [message, setMessage] = useRecoilState(ForwardMessageAtom);

  return (
    <Modal
      open={!!message}
      onClose={() => setMessage(null)}
      style={{ maxWidth: '600px', width: '100vw' }}
    >
      <ForwardMessage />
    </Modal>
  );
};

export const ForwardMessage = () => {
  const [message, setMessage] = useRecoilState(ForwardMessageAtom);
  const [channels, setChannels] = useState<ChannelType[]>([]);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState('');

  return (
    <ModalContent title={Languages.t('scenes.apps.messages.message.forward.title')}>
      <ChannelSelector
        initialChannels={[]}
        onChange={channels => {
          setChannels(channels);
        }}
      />

      <Input
        className="w-full mt-2"
        placeholder={Languages.t('scenes.apps.messages.message.forward.comment')}
        value={comment}
        onChange={e => setComment(e.target.value)}
      />
      <Button
        className="w-full mt-2 text-center justify-center"
        disabled={channels.length === 0}
        loading={loading}
        onClick={async () => {
          setLoading(true);
          if (message) {
            for (const channel of channels) {
              await MessageThreadAPIClient.save(channel.company_id || '', {
                message: {
                  thread_id: uuidv1(),
                  created_at: Date.now(),
                  user_id: Login.currentUserId,
                  context: {
                    _front_id: uuidv1(),
                  },

                  text: comment,
                  quote_message: {
                    ...message,
                  } as unknown as NodeMessage,
                } as NodeMessage,
                participants: [
                  {
                    type: 'channel',
                    id: channel.id || '',
                    company_id: channel.company_id || '',
                    workspace_id: channel.workspace_id || '',
                  },
                ],
              });
            }

            ToasterService.success(Languages.t('scenes.apps.messages.message.forward.send'));
            setMessage(null);
          }
        }}
      >
        {Languages.t('scenes.apps.messages.message.forward.confirm', [channels.length])}
      </Button>
    </ModalContent>
  );
};
