// eslint-disable-next-line @typescript-eslint/no-use-before-define
import React, { lazy, Suspense } from 'react';

import InitService from 'app/features/global/services/init-service';

const InternalLogin = lazy(() => import('app/views/login/internal/internal-login'));
const ConsoleLogin = lazy(() => import('app/views/login/console/console-login'));

export default () => (
  <Suspense fallback={<></>}>
    {InitService.server_infos?.configuration?.accounts.type === 'remote' ? (
      <ConsoleLogin />
    ) : (
      <InternalLogin />
    )}
  </Suspense>
);
