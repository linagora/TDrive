import Avatar from 'app/atoms/avatar';
import UsersService from 'app/features/users/services/current-user-service';
import { useUser } from 'app/features/users/hooks/use-user';
import { Button } from 'app/atoms/button/button';
import Languages from 'app/features/global/services/languages-service';
import { useChannelMember } from 'app/features/channel-members-search/hooks/member-hook';
import { PlusIcon } from '@heroicons/react/solid';
import useRouterWorkspace from 'app/features/router/hooks/use-router-workspace';
import React from 'react';
import { Modal, ModalContent } from 'app/atoms/modal';
import useRouterCompany from 'app/features/router/hooks/use-router-company';
import ConsoleService from 'app/features/console/services/console-service';
import MemberGrade from 'app/views/client/popup/WorkspaceParameter/Pages/WorkspacePartnerTabs/MemberGrade';

type IUserProps = {
  userId: string;
};

export const UserItem = (props: IUserProps): JSX.Element => {
  const { userId } = props;
  const user = useUser(userId || '');
  const workspaceId = useRouterWorkspace();
  const companyId = useRouterCompany();
  const [confirmWorkspaceInvitation, setConfirmWorkspaceInvitation] =
    React.useState<boolean>(false);

  if (!user) {
    return <></>;
  }

  const { addMember, loading } = useChannelMember(userId || '');
  const [full_name, avatar] = [UsersService.getFullName(user), UsersService.getThumbnail(user)];

  const _addMember = () => {
    if (!(user.workspaces || []).map(w => w.id).includes(workspaceId)) {
      //Ask for confirmation to invite the user to the workspace first
      setConfirmWorkspaceInvitation(true);
    } else {
      addMember(userId || '');
    }
  };

  return (
    <>
      <Modal open={confirmWorkspaceInvitation} onClose={() => setConfirmWorkspaceInvitation(false)}>
        <ModalContent
          theme="warning"
          title="Also invite to the workspace?"
          text="This user is not in the current workspace, he will be invited."
          buttons={[
            <Button key="no" theme="default" onClick={() => setConfirmWorkspaceInvitation(false)}>
              {Languages.t('general.no')}
            </Button>,
            <Button
              className="mr-2"
              key="yes"
              theme="primary"
              onClick={async () => {
                setConfirmWorkspaceInvitation(false);
                await ConsoleService.addMailsInWorkspace({
                  workspace_id: workspaceId || '',
                  company_id: companyId || '',
                  emails: [user.email],
                });
                await addMember(userId || '');
              }}
            >
              {Languages.t('general.yes')}
            </Button>,
          ]}
        ></ModalContent>
      </Modal>

      <div className="w-8 flex items-center ">
        <Avatar size="xs" avatar={avatar} />
      </div>
      <div className="grow flex items-center overflow-hidden ">
        <div className="whitespace-nowrap overflow-hidden text-ellipsis">
          <span className="font-bold">{full_name}</span>
          <span className="pl-2">{user.email}</span>
        </div>
      </div>
      <div className="mr-2 flex items-center">
        <MemberGrade
          companyRole={user.companies?.find(c => c.company.id === companyId)?.role || ''}
          workspaceRole={user.workspaces?.find(c => c.id === workspaceId)?.role || ''}
        />
      </div>
      <div>
        <Button
          theme="primary"
          size="sm"
          icon={PlusIcon}
          loading={loading}
          onClick={() => _addMember()}
        />
      </div>
    </>
  );
};
