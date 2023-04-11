import { ToasterService } from 'app/features/global/services/toaster-service';
import useRouterCompany from 'app/features/router/hooks/use-router-company';
import useRouterWorkspace from 'app/features/router/hooks/use-router-workspace';
import { useRecoilState } from 'recoil';
import invitationApiClient from '../api/invitation-api-client';
import { invitationChannelListState, invitationEmailsState, invitationSentState } from '../state/invitation';
import { useInvitationChannels } from './use-invitation-channels';

export const useInvitation = () => {
  const companyId = useRouterCompany();
  const workspaceId = useRouterWorkspace();
  const [invitedUsers, setInvitedUsers] = useRecoilState(invitationEmailsState);
  const [channels] = useRecoilState(invitationChannelListState);
  const [, setSentState] = useRecoilState(invitationSentState);
  const { reset: resetChannels } = useInvitationChannels();

  const send = async () => {
    try {
      await invitationApiClient.inviteToWorkspace(
        companyId,
        workspaceId,
        invitedUsers,
        channels.map(channel => channel.id as string),
      );
      setSentState(true);
    }
    catch(error) {
     ToasterService.error((error as Error).toString());
    }
  }

  const generateInvitationLink = async () => {
    try {
      const token = await invitationApiClient.createInvitationToken(
        companyId,
        workspaceId,
        channels.map(channel => channel.id as string),
      );

      return `${window.location.origin}/?join=${token}`;
    }
    catch(error) {
      ToasterService.error((error as Error).toString());
    }
  }

  const reset = () => {
    setSentState(false);
    setInvitedUsers([]);
    resetChannels();
  }

  return { send, generateInvitationLink, reset };
};
