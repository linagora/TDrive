/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Transition } from '@headlessui/react';
import { ChevronLeftIcon } from '@heroicons/react/outline';
import A from 'app/atoms/link';
import { Loader } from 'app/atoms/loader';
import { Modal, ModalContent } from 'app/atoms/modal';
import { useUsersSearchModal } from 'app/features/channel-members-search/state/search-channel-member';
import ChannelAPIClient from 'app/features/channels/api/channel-api-client';
import { useChannel } from 'app/features/channels/hooks/use-channel';
import { useFavoriteChannels } from 'app/features/channels/hooks/use-favorite-channels';
import { channelAttachmentListState } from 'app/features/channels/state/channel-attachment-list';
import { ChannelType } from 'app/features/channels/types/channel';
import useRouteState from 'app/features/router/hooks/use-route-state';
import { useEffect, useState } from 'react';
import { atom, useRecoilState, useSetRecoilState } from 'recoil';
import { slideXTransition, slideXTransitionReverted } from 'src/utils/transitions';
import { ChannelAccessForm } from './channel-access';
import { ChannelInformationForm } from './channel-information';
import { ChannelNotificationsForm } from './channel-notifications';
import { ChannelSettingsMenu } from './channel-settings-menu';
import RouterServices from '@features/router/services/router-service';
import Languages from 'app/features/global/services/languages-service';

const EditChannelModalAtom = atom({
  key: 'EditChannelModalAtom',
  default: {
    open: false,
    channelId: '',
  },
});

export const useOpenChannelModal = () => {
  const setModal = useSetRecoilState(EditChannelModalAtom);
  return (channelId: string) => setModal({ open: true, channelId });
};

export const EditChannelModal = () => {
  const [channelModal, setChannelModal] = useRecoilState(EditChannelModalAtom);

  return (
    <Modal
      open={channelModal.open}
      onClose={() => setChannelModal({ ...channelModal, open: false })}
      className="int-channel-edit-modal !max-w-sm"
    >
      {!channelModal.channelId && <CreateChannelForm />}
      {!!channelModal.channelId && <EditChannelForm />}
    </Modal>
  );
};

const EditChannelForm = () => {
  const [channelModal, setChannelModal] = useRecoilState(EditChannelModalAtom);
  const [page, setPage] = useState<'information' | 'access' | 'notifications' | 'menu'>('menu');
  const { setOpen: setParticipantsOpen } = useUsersSearchModal();
  const [, setChannelAttachmentState] = useRecoilState(channelAttachmentListState);
  const { refresh } = useFavoriteChannels();

  const { channel } = useChannel(channelModal.channelId);

  return (
    <ModalContent
      title={
        <div className="flex flex-row items-center justify-start">
          {page !== 'menu' && (
            <A onClick={() => setPage('menu')}>
              <ChevronLeftIcon className="w-6 h-6" />
            </A>
          )}
          <span className="ml-2">{Languages.t('scenes.app.channelsbar.modify_channel_menu')}</span>
        </div>
      }
    >
      <hr className="my-1 -mx-4" />

      <div
        style={{
          display: 'grid',
          gridTemplate: '1fr / 1fr',
        }}
      >
        <Transition
          style={{
            gridColumn: '1 / 1',
            gridRow: '1 / 1',
          }}
          show={page === 'menu'}
          as="div"
          {...(page === 'menu' ? slideXTransitionReverted : slideXTransition)}
        >
          <ChannelSettingsMenu
            onEditChannel={() => setPage('information')}
            onAccess={() => setPage('access')}
            onNotifications={() => setPage('notifications')}
            onClose={() => {
              setChannelModal({ ...channelModal, open: false });
            }}
            onMembers={() => {
              setChannelModal({ ...channelModal, open: false });
              setTimeout(() => setParticipantsOpen(true), 500);
            }}
            onMedias={() => {
              setChannelModal({ ...channelModal, open: false });
              setTimeout(() => setChannelAttachmentState(true), 500);
            }}
            channel={channel}
          />
        </Transition>
        <Transition
          style={{
            gridColumn: '1 / 1',
            gridRow: '1 / 1',
          }}
          show={page === 'information'}
          as="div"
          {...(page === 'menu' ? slideXTransitionReverted : slideXTransition)}
        >
          <ChannelInformationForm
            onChange={async changes => {
              setPage('menu');
              await ChannelAPIClient.save(
                { ...channel, ...changes },
                {
                  companyId: channel.company_id!,
                  workspaceId: channel.workspace_id!,
                  channelId: channel.id,
                },
              );
              await refresh();
            }}
            channel={channel}
          />
        </Transition>
        <Transition
          style={{
            gridColumn: '1 / 1',
            gridRow: '1 / 1',
          }}
          show={page === 'access'}
          as="div"
          {...(page === 'menu' ? slideXTransitionReverted : slideXTransition)}
        >
          <ChannelAccessForm
            onChange={async changes => {
              await ChannelAPIClient.save(
                { ...channel, ...changes },
                {
                  companyId: channel.company_id!,
                  workspaceId: channel.workspace_id!,
                  channelId: channel.id,
                },
              );
              await refresh();
              setPage('menu');
            }}
            channel={channel}
          />
        </Transition>
        <Transition
          style={{
            gridColumn: '1 / 1',
            gridRow: '1 / 1',
          }}
          show={page === 'notifications'}
          as="div"
          {...(page === 'menu' ? slideXTransitionReverted : slideXTransition)}
        >
          <ChannelNotificationsForm onBack={() => setPage('menu')} channel={channel} />
        </Transition>
      </div>
    </ModalContent>
  );
};

const CreateChannelForm = () => {
  const setChannelModal = useSetRecoilState(EditChannelModalAtom);
  const { setOpen: setParticipantsOpen } = useUsersSearchModal();
  const { companyId, workspaceId } = useRouteState();
  const { refresh } = useFavoriteChannels();

  const [step, setStep] = useState(0);
  const [channel, setChannel] = useState<Partial<ChannelType>>({});

  useEffect(() => {
    if (step === 2) {
      (async () => {
        const created = await ChannelAPIClient.save(channel, {
          companyId: companyId!,
          workspaceId: workspaceId!,
        });
        await refresh();
        RouterServices.push(RouterServices.generateRouteFromState({ channelId: created.id }));
        setChannelModal({ open: false, channelId: '' });
        setTimeout(() => {
          setParticipantsOpen(true);
        }, 500);
      })();
    }
  }, [step]);

  return (
    <ModalContent title={Languages.t('scenes.app.channelsbar.channelsworkspace.create_channel')}>
      <hr className="my-1 -mx-4" />

      <div
        style={{
          display: 'grid',
          gridTemplate: '1fr / 1fr',
        }}
      >
        <Transition
          style={{
            gridColumn: '1 / 1',
            gridRow: '1 / 1',
          }}
          show={step === 0}
          as="div"
          {...slideXTransition}
        >
          <ChannelInformationForm
            onChange={changes => {
              setStep(1);
              setChannel({ ...channel, ...changes });
            }}
          />
        </Transition>

        <Transition
          style={{
            gridColumn: '1 / 1',
            gridRow: '1 / 1',
          }}
          show={step === 1}
          as="div"
          {...slideXTransition}
        >
          <ChannelAccessForm
            onChange={async changes => {
              setStep(2);
              setChannel({ ...channel, ...changes });
            }}
          />
        </Transition>

        <Transition
          style={{
            gridColumn: '1 / 1',
            gridRow: '1 / 1',
          }}
          show={step === 2}
          as="div"
          {...slideXTransition}
        >
          <div className="flex items-center justify-center w-screen max-w-md h-screen max-h-96">
            <Loader className="w-6 h-6" />
          </div>
        </Transition>
      </div>
    </ModalContent>
  );
};
