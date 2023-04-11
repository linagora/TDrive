import { MailIcon } from '@heroicons/react/outline';
import { XIcon } from '@heroicons/react/solid';
import { Tooltip } from 'antd';
import { Button } from 'app/atoms/button/button';
import { Modal, ModalContent } from 'app/atoms/modal';
import { Info } from 'app/atoms/text';
import { usePendingEmail } from 'app/features/channel-members-search/hooks/use-pending-email-hook';
import Languages from 'app/features/global/services/languages-service';
import { PendingEmail } from 'app/features/pending-emails/types/pending-email';
import useRouterCompany from 'app/features/router/hooks/use-router-company';
import useRouterWorkspace from 'app/features/router/hooks/use-router-workspace';
import WorkspaceUserAPIClient from 'app/features/workspace-members/api/workspace-members-api-client';
import { WorkspacePendingUserType } from 'app/features/workspaces/types/workspace';
import { useState } from 'react';

type IProps = {
  email: PendingEmail;
};

export const EmailItem = (props: IProps): JSX.Element => {
  const { email } = props.email;
  const { loading, cancelInvite } = usePendingEmail(email);
  const workspaceId = useRouterWorkspace();
  const companyId = useRouterCompany();
  const [cancelWorkspaceInvitation, setCancelWorkspaceInvitation] =
    useState<WorkspacePendingUserType | null>(null);

  const _cancelInvite = async () => {
    //Also check if the user is pending in the workspace and display something if that's the case
    const pending = await WorkspaceUserAPIClient.listPending(companyId, workspaceId);
    const foundWorkspacePending = pending.find(
      p => p.email.toLocaleLowerCase() === email.toLocaleLowerCase(),
    );
    if (foundWorkspacePending) {
      //Propose to also cancel workspace invitation
      setCancelWorkspaceInvitation(foundWorkspacePending);
    } else {
      await cancelInvite();
    }
  };

  return (
    <>
      <Modal open={!!cancelWorkspaceInvitation} onClose={() => setCancelWorkspaceInvitation(null)}>
        <ModalContent
          theme="warning"
          title="Remove workspace invitation ?"
          text="Do you want to cancel also the workspace invitation?"
          buttons={[
            <Button
              key="no"
              theme="default"
              onClick={() => {
                setCancelWorkspaceInvitation(null);
                cancelInvite();
              }}
            >
              {Languages.t('general.no')}
            </Button>,
            <Button
              className="mr-2"
              key="yes"
              theme="primary"
              onClick={() => {
                setCancelWorkspaceInvitation(null);
                cancelInvite();
                WorkspaceUserAPIClient.cancelPending(companyId, workspaceId, email);
              }}
            >
              {Languages.t('general.yes')}
            </Button>,
          ]}
        ></ModalContent>
      </Modal>
      <div className="flex grow items-center space-x-1">
        <MailIcon className="h-6 w-6 text-zinc-500" />
        <div>
          <span className="pl-2">
            {email}{' '}
            <Info>
              (
              {Languages.t(
                'scenes.client.channels_bar.modals.parts.channel_member_row.label.pending_email',
              )}
              )
            </Info>
          </span>
        </div>
      </div>
      <div>
        <Tooltip
          placement="top"
          title={Languages.t('scenes.app.popup.workspaceparameter.pages.cancel_invitation')}
        >
          <Button
            theme="default"
            size="sm"
            icon={XIcon}
            loading={loading}
            onClick={() => _cancelInvite()}
          ></Button>
        </Tooltip>
      </div>
    </>
  );
};
