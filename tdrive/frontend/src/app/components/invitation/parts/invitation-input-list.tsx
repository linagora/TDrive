/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from 'app/atoms/button/button';
import { RemoveIcon } from 'app/atoms/icons-colored';
import { Input } from 'app/atoms/input/input-text';
import {
  invitationEmailsState,
  InvitationType,
  invitationTypeState,
} from 'app/features/invitation/state/invitation';
import React, { useState } from 'react';
import { useRecoilState } from 'recoil';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useCurrentUser } from 'app/features/users/hooks/use-current-user';
import { useInvitationUsers } from 'app/features/invitation/hooks/use-invitation-users';
import ReachedLimit from './reached-limit';
import Languages from 'app/features/global/services/languages-service';
import { PlusIcon } from '@heroicons/react/outline';
import Select from 'app/atoms/input/input-select';

export default (): React.ReactElement => {
  const [invitations, setInvitations] = useRecoilState(invitationEmailsState);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [notValidEmail, setNotValidEmail] = useState<boolean>(false);
  const [invitationTargetType] = useRecoilState(invitationTypeState);
  const { user } = useCurrentUser();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  const currentUserEmailDomain = user?.email.split('@').pop();
  const { can_add_invitations, members_limit_reached, allowed_members, allowed_guests } =
    useInvitationUsers();

  const emailExists = (target: string): boolean =>
    !!invitations.find(invitation => invitation.email === target);

  const handleEnter = (event: unknown): void => {
    if ((event as KeyboardEvent).key === 'Enter') {
      handleAdd();
    }
  };

  const handleAdd = (): void => {
    const role = invitationTargetType;
    if (emailRegex.test(currentInput) && !emailExists(currentInput)) {
      setInvitations([...invitations, { email: currentInput, role }]);
      setCurrentInput('');
      setNotValidEmail(false);
    } else {
      setNotValidEmail(true);
    }
  };

  const removeEmail = (targetEmail: string): void => {
    setInvitations(invitations.filter(invitation => invitation.email !== targetEmail));
  };

  const handleInput = (event: any): void => {
    setCurrentInput(event.target.value);
    setNotValidEmail(!emailRegex.test(event.target.value) || emailExists(event.target.value));
  };

  const handleRoleChange = (email: string, role: InvitationType): void => {
    if (role === InvitationType.guest && allowed_guests <= 0) return;
    if (role === InvitationType.member && allowed_members <= 0) return;

    const changedInvitations = invitations.map(invitation => {
      if (invitation.email === email) {
        return {
          email,
          role,
        };
      }

      return invitation;
    });

    setInvitations(changedInvitations);
  };

  return (
    <div className="flex flex-col border-transparent w-full">
      {can_add_invitations ? (
        <div className="flex flex-row">
          <Input
            className="rounded-r-none grow"
            theme="outline"
            placeholder={Languages.t('components.invitation.invitation_input_list.placeholder')}
            value={currentInput}
            onKeyDown={handleEnter}
            onChange={handleInput}
            hasError={notValidEmail}
          />
          <Button
            theme="primary"
            disabled={notValidEmail || !currentInput.length}
            onClick={handleAdd}
            className="justify-center rounded-l-none"
          >
            <PlusIcon className="h-4 w-4 mr-1.5 -ml-1" />
            {Languages.t('components.invitation.invitation_input_list.add')}
          </Button>
        </div>
      ) : members_limit_reached ? (
        <ReachedLimit />
      ) : (
        <></>
      )}
      <PerfectScrollbar
        className="-mb-2 py-2 overflow-hidden -mx-2 px-2"
        style={{ maxHeight: 'calc(30vh - 100px)', minHeight: 'calc(30vh - 100px)' }}
        options={{ suppressScrollX: true, suppressScrollY: false }}
      >
        {invitations.map(invitation => (
          <div
            className="flex flex-row border-transparent items-center rounded-md py-0.5 my-0.5"
            key={invitation.email}
          >
            <RemoveIcon
              className="cursor-pointer shrink-0 mr-2"
              onClick={() => removeEmail(invitation.email)}
            />
            <Input
              theme="outline"
              className="rounded-r-none grow w-full -mr-px"
              disabled={true}
              value={invitation.email}
            />
            <Select
              theme="outline"
              className="rounded-l-none w-auto"
              onChange={e =>
                handleRoleChange(invitation.email, e.target.value as unknown as InvitationType)
              }
              value={invitation.role}
              disabled={
                (invitation.role === InvitationType.guest && allowed_members <= 0) ||
                (invitation.role === InvitationType.member && allowed_guests <= 0)
              }
            >
              <option value={InvitationType.member}>
                {Languages.t('components.invitation.invitation_input_list.member', [], 'Member')}
              </option>
              <option value={InvitationType.guest}>
                {Languages.t('components.invitation.invitation_input_list.guest', [], 'Guest')}
              </option>
            </Select>
          </div>
        ))}
      </PerfectScrollbar>
    </div>
  );
};
