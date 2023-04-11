import { useRecoilState } from 'recoil';

import {
  AtomPendingEmailsKey,
  PendingEmail,
} from 'app/features/pending-emails/types/pending-email';
import { useGlobalEffect } from 'app/features/global/hooks/use-global-effect';
import { LoadingState } from 'app/features/global/state/atoms/Loading';
import { PendingEmailsState } from 'app/features/pending-emails/state/pending-emails';
import PendingEmailsAPIClient from '../api/pending-emails-api-client';

export const usePendingEmails = (
  key: AtomPendingEmailsKey,
): {
  pendingEmails: PendingEmail[];
  loading: boolean;
  refresh: () => Promise<void>;
} => {
  const [pendingEmails, _setPendingEmails] = useRecoilState(PendingEmailsState(key));
  const [loading, setLoading] = useRecoilState(LoadingState(`pending-emails-${key.channelId}`));

  const refresh = async () => {
    const pendingEmailsUpdated: PendingEmail[] | undefined = await PendingEmailsAPIClient.list(key);

    if (pendingEmailsUpdated) _setPendingEmails(pendingEmailsUpdated);
  };

  useGlobalEffect(
    'usePendingEmails',
    async () => {
      if (!pendingEmails) setLoading(true);

      await refresh();

      setLoading(false);
    },
    [key, pendingEmails],
  );

  // useRealTimeHook

  return {
    pendingEmails,
    loading,
    refresh,
  };
};
