import { Suspense } from 'react';

import InitService from 'app/features/global/services/init-service';
import Client from 'app/views/client';

export default () => {
  const isAppReady = InitService.useWatcher(() => InitService.app_ready);

  if (!isAppReady) {
    return <div />;
  }

  return (
    <Suspense fallback={<></>}>
      <Client />
    </Suspense>
  );
};
