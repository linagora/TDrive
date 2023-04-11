/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  invitationEmailsState,
  invitationTypeState,
  InvitedUser,
} from 'app/features/invitation/state/invitation';
import { useRecoilState } from 'recoil';
import ChipInput from 'material-ui-chip-input';
import { RemoveIcon } from 'app/atoms/icons-colored';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useCurrentUser } from 'app/features/users/hooks/use-current-user';
import { useInvitationUsers } from 'app/features/invitation/hooks/use-invitation-users';
import ReachedLimit from './reached-limit';

const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

export default (): React.ReactElement => {
  const [invitations, setInvitations] = useRecoilState(invitationEmailsState);
  const [role] = useRecoilState(invitationTypeState);
  const { user } = useCurrentUser();
  const { can_add_invitations, members_limit_reached } = useInvitationUsers();

  const emails = (invitations || []).map(invitation => invitation.email);
  const currentUserEmailDomain = user?.email.split('@').pop();

  const handleChange = (chips: string[]) => {
    const newInvitations: InvitedUser[] = chips
      .filter(chip => !invitations.find(invitation => invitation.email === chip))
      .map(chip => ({ email: chip, role }));
    const updatedInvitations = [...invitations, ...newInvitations];

    setInvitations(updatedInvitations);
  };

  const validate = (chip: string): boolean => {
    return emailRegex.test(chip) && currentUserEmailDomain === chip.split('@').pop();
  };

  const handleDelete = (chip: string) => {
    const updatedInvitations = invitations.filter(({ email }) => email !== chip);

    setInvitations(updatedInvitations);
  };

  const rederChip = (
    { chip, handleDelete }: { chip: string; handleDelete: React.EventHandler<any> },
    key: string,
  ): React.ReactElement => {
    return (
      <div
        key={key}
        className="flex justify-center items-center m-2 my-2 px-3 py-2 space-x-2 h-9 rounded-md bg-white"
      >
        <RemoveIcon onClick={handleDelete} className="cursor-pointer" />
        <div className="flex-initial max-w-full leading-none text-xs font-normal">{chip}</div>
      </div>
    );
  };

  return (
    <PerfectScrollbar
      className="-mb-4 overflow-hidden px-2"
      style={{ maxHeight: 'calc(42vh - 98px)', minHeight: 'calc(42vh - 98px)' }}
      options={{ suppressScrollX: true, suppressScrollY: false }}
    >
      {members_limit_reached && <ReachedLimit />}
      <ChipInput
        value={emails}
        disableUnderline={true}
        fullWidth={true}
        blurBehavior="ignore"
        newChipKeyCodes={[13, 188, 54, 190, 32]}
        onBeforeAdd={validate}
        variant="standard"
        className="bg-zinc-200 border-none hover:border-none rounded-md py-1"
        chipRenderer={rederChip}
        onChange={handleChange}
        onDelete={handleDelete}
        clearInputValueOnChange={false}
        disabled={!can_add_invitations}
      />
    </PerfectScrollbar>
  );
};
