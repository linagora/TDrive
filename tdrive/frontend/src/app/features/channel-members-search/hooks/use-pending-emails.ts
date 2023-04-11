import { LoadingState } from 'app/features/global/state/atoms/Loading';
import useRouterChannel from 'app/features/router/hooks/use-router-channel';
import useRouterCompany from 'app/features/router/hooks/use-router-company';
import useRouterWorkspace from 'app/features/router/hooks/use-router-workspace';
import { useRecoilState } from 'recoil';
import { ListPendingEmailsStateFamily } from '../state/store';
import { ChannelPendingEmail, ParamsChannelMember } from '../types/channel-members';
import ChannelPendingEmailApiClient from 'app/features/channel-members-search/api/pending-emails-api-client';
import { useGlobalEffect } from 'app/features/global/hooks/use-global-effect';

export function useChannelPendingEmails(params?: ParamsChannelMember): {
  pendingEmails: ChannelPendingEmail[];
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const companyId = params?.companyId ? params.companyId : useRouterCompany();
  const channelId = params?.companyId ? params.companyId : useRouterChannel();
  const workspaceId = params?.companyId ? params.companyId : useRouterWorkspace();

  const parameters = { companyId, workspaceId, channelId };

  const [loading, setLoading] = useRecoilState(LoadingState('useChannelPendingEmails'));
  const [emails, setEmails] = useRecoilState(ListPendingEmailsStateFamily(parameters));

  const refresh = async () => {
    setLoading(true);
    const listPendingEmails = await ChannelPendingEmailApiClient.list(parameters);

    if (listPendingEmails) {
      setEmails(listPendingEmails);
    }
    setLoading(false);
  };

  useGlobalEffect(
    'useChannelPendingEmails',
    () => {
      refresh();
    },
    [channelId],
  );

  return {
    pendingEmails: emails,
    loading,
    refresh,
  };
}
