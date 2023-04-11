import React, { useState } from 'react';
import { Button } from 'app/atoms/button/button';
import { Modal, ModalContent } from 'app/atoms/modal';
import {
  invitationActiveTab,
  invitationEmailsState,
  invitationSentState,
  invitationState,
} from 'app/features/invitation/state/invitation';
import { useCurrentWorkspace } from 'app/features/workspaces/hooks/use-workspaces';
import Tab from 'app/molecules/tabs';
import { useRecoilState } from 'recoil';
import Bulk_invitation from './parts/bulk-invitation';
import Custom_role_invitation from './parts/custom-role-invitation';
import InvitationChannels from './parts/invitation-channels';
import InvitationSent from './parts/invitation-sent';
import { useInvitation } from 'app/features/invitation/hooks/use-invitation';
import Languages from 'app/features/global/services/languages-service';
import WorkspaceLink from './parts/workspace-link';
import InvitationTarget from './parts/invitation-target';
import AllowAnyoneByEmail from './parts/allow-anyone-by-email';
import { Info, Subtitle } from 'app/atoms/text';

enum InvitationTabs {
  custom = 0,
  bulk = 1,
}

export default (): React.ReactElement => {
  const [isOpen, setOpen] = useRecoilState(invitationState);
  const [activeTab, setInvitationTab] = useRecoilState(invitationActiveTab);
  const [invitations] = useRecoilState(invitationEmailsState);
  const workspace = useCurrentWorkspace();
  const [isInvitationSent] = useRecoilState(invitationSentState);
  const { send, reset } = useInvitation();
  const [sending, setSending] = useState<boolean>(false);

  const handleSend = async () => {
    setSending(true);
    try {
      await send();
    } catch (error) {
      console.debug(error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={() => {
        setOpen(false);
        reset();
      }}
      className="sm:w-[60vw] sm:max-w-2xl"
      style={{ minHeight: 'calc(70vh - 98px)' }}
    >
      <ModalContent
        textCenter
        title={
          isInvitationSent
            ? ''
            : Languages.t(
                'components.invitation.title',
                [workspace.workspace?.name],
                `Invite users to ${workspace.workspace?.name}`,
              )
        }
      >
        {!isInvitationSent ? (
          <>
            <AllowAnyoneByEmail />

            <Subtitle className="mt-6 block">Manual invitation</Subtitle>
            <Info className="block">
              You can configure exactly where the user will be invited and what role they will have.
            </Info>
            <InvitationTarget />

            <Info className="block mt-2 mb-1">
              Simply send this email to the users you want to invite.
            </Info>
            <WorkspaceLink />

            <Info className="block mt-4">Or enter manually the emails here.</Info>

            {/*<Tab
              tabs={[
                <div key="custom_role_invitation">
                  {Languages.t('components.invitation.custom_role_invitation')}
                </div>,
                <div key="bulk_invitation">
                  {Languages.t('components.invitation.bulk_invitation')}
                </div>,
              ]}
              selected={activeTab}
              onClick={index => setInvitationTab(index)}
              className="w-full"
              parentClassName="basis-1/2 justify-center"
            />
            {activeTab === InvitationTabs.custom && <Custom_role_invitation />}
            {activeTab === InvitationTabs.bulk && <Bulk_invitation />}*/}
            <Custom_role_invitation />
            <Button
              className="mt-2 justify-center w-full"
              disabled={!invitations.length || sending}
              onClick={() => handleSend()}
              loading={sending}
            >
              {Languages.t('components.invitation.button', [], 'Send invitations')}
              <div className="font-medium h-5 px-1.5 flex items-center justify-center text-sm rounded-full ml-1 bg-white text-blue-500">
                {invitations.length}
              </div>
            </Button>

            <InvitationChannels />
          </>
        ) : (
          <InvitationSent />
        )}
      </ModalContent>
    </Modal>
  );
};
