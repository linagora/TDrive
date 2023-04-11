import { useCurrentCompany } from 'app/features/companies/hooks/use-companies';
import { useCurrentUser } from 'app/features/users/hooks/use-current-user';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { invitationEmailsState, InvitationType, invitationTypeState } from '../state/invitation';

export const useInvitationUsers = () => {
  const { company } = useCurrentCompany();
  const [invitedUsers, setInvitedUsers] = useRecoilState(invitationEmailsState);
  const [role] = useRecoilState(invitationTypeState);
  const { user: currentUser } = useCurrentUser();
  const currentUserEmailDomain = currentUser?.email.split('@').pop();
  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

  const [allowedMembers, setAllowedMembers] = useState<number>(
    company.plan?.limits?.['company:members_limit'] === -1
      ? Infinity
      : company.plan?.limits?.['company:members_limit'] || Infinity,
  );
  const [allowedGuests, setAllowedGuests] = useState<number>(
    company.plan?.limits?.['company:guests_limit'] === -1
      ? Infinity
      : company.plan?.limits?.['company:guests_limit'] || Infinity,
  );
  const [canAddInvitations, setCanAddInvitations] = useState<boolean>(
    role === InvitationType.member ? allowedMembers > 0 : allowedGuests > 0,
  );
  const [membersLimitReached, setMembersLimitReached] = useState<boolean>(false);

  useEffect(() => {
    const invitedMembers = invitedUsers.filter(({ role }) => role === InvitationType.member);
    const invitedGuests = invitedUsers.filter(({ role }) => role === InvitationType.guest);

    setAllowedMembers(
      (company.plan?.limits?.['company:members_limit'] === -1
        ? Infinity
        : company.plan?.limits?.['company:members_limit'] || Infinity) - invitedMembers.length,
    );
    setAllowedGuests(
      (company.plan?.limits?.['company:guests_limit'] === -1
        ? Infinity
        : company.plan?.limits?.['company:guests_limit'] || Infinity) - invitedGuests.length,
    );

    if (role === InvitationType.member) {
      setMembersLimitReached(allowedMembers <= 0);
    } else {
      setMembersLimitReached(false);
    }

    setCanAddInvitations(role === InvitationType.member ? allowedMembers > 0 : allowedGuests > 0);
  }, []);

  const addInvitation = (email: string): void => {
    if (!emailRegex.test(email)) return;
    if (email.split('@').pop() !== currentUserEmailDomain) return;
    if (role === InvitationType.member && allowedMembers <= 0) return;
    if (role === InvitationType.guest && allowedGuests <= 0) return;
    if (invitedUsers.find(invitation => invitation.email === email)) return;

    setInvitedUsers([...invitedUsers, { email, role }]);
  };

  return {
    allowed_members: allowedMembers,
    allowed_guests: allowedGuests,
    addInvitation,
    can_add_invitations: canAddInvitations,
    members_limit_reached: membersLimitReached,
  };
};
