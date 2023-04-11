/* eslint-disable @typescript-eslint/no-unused-vars */
import { atomFamily } from 'recoil';

import {
  AtomPendingEmailsKey,
  PendingEmail,
} from 'app/features/pending-emails/types/pending-email';

export const PendingEmailsState = atomFamily<PendingEmail[], AtomPendingEmailsKey>({
  key: 'PendingEmailsState',
  default: _key => [],
});
