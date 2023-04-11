import ChannelPendingEmailApiClient from 'app/features/channel-members-search/api/pending-emails-api-client';
import ConsoleService from 'app/features/console/services/console-service';
import useRouterChannel from 'app/features/router/hooks/use-router-channel';
import useRouterCompany from 'app/features/router/hooks/use-router-company';
import useRouterWorkspace from 'app/features/router/hooks/use-router-workspace';
import { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { SearchChannelMemberInputState } from '../state/search-channel-member';
import { PendingEmailSelector } from '../state/store';
import { useChannelPendingEmails } from './use-pending-emails';

export function usePendingEmail(email: string) {
  const companyId = useRouterCompany();
  const workspaceId = useRouterWorkspace();
  const channelId = useRouterChannel();

  const pEmail = useRecoilValue(PendingEmailSelector({ channelId, email }));
  const { refresh } = useChannelPendingEmails();
  const [loading, setLoading] = useState<boolean>(false);

  const setSearchState = useSetRecoilState(SearchChannelMemberInputState);

  const cancelInvite = async () => {
    setLoading(true);

    await ChannelPendingEmailApiClient.delete(email, {
      companyId,
      workspaceId,
      channelId,
    }).then(() => {
      setLoading(false);
      refresh();
    });
  };

  const addInvite = async (role: 'guest' | 'member' = 'guest') => {
    setLoading(true);

    const guest = {
      workspace_id: workspaceId,
      channel_id: channelId,
      company_id: companyId,
      email: email,
    };

    await ChannelPendingEmailApiClient.add(guest, {
      companyId,
      workspaceId,
      channelId,
    }).then(() => {
      setLoading(false);
      setSearchState('');
      refresh();
    });

    await ConsoleService.addMailsInWorkspace({
      workspace_id: workspaceId,
      company_id: companyId,
      emails: [email],
      workspace_role: 'member',
      company_role: role,
    });
  };

  return {
    loading,
    email: pEmail,
    cancelInvite,
    addInvite,
  };
}
