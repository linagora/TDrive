import { Loader } from 'app/atoms/loader';
import { OpenDesktopPopup } from 'app/components/open-desktop-popup/open-desktop-popup';
import Electron from 'app/features/global/framework/electron-service';
import { useGlobalEffect } from 'app/features/global/hooks/use-global-effect';
import { LoadingState } from 'app/features/global/state/atoms/Loading';
import { useWebState } from 'app/features/global/state/atoms/use-web';
import { getDevice } from 'app/features/global/utils/device';
import { useCurrentUser } from 'app/features/users/hooks/use-current-user';
import React from 'react';
import { useRecoilState } from 'recoil';
import { detectDesktopAppPresence } from 'src/utils/browser-detect';

type PropsType = {
  children: React.ReactNode;
};

export const addUrlTryDesktop = (url: string) => {
  url = url || '';
  const base = url.split('?')[0] || '';
  const search = url.split('?')[1] || '';
  return base + '?' + [...search.split('&').filter(a => a), 'try_desktop'].join('&');
};

const initialPath = document.location.pathname;
const initialParams = new URLSearchParams(document.location.search);

export default ({ children }: PropsType): React.ReactElement => {
  const [useWeb, setUseWeb] = useRecoilState(useWebState);
  const [loading, setLoading] = useRecoilState(LoadingState('DesktopRedirect'));
  const { user } = useCurrentUser();
  const os = getDevice();

  const shouldTryDesktop =
    os === 'other' &&
    user?.id &&
    (initialPath.length <= 1 || initialParams.get('try_desktop') !== null);

  useGlobalEffect(
    'desktopRedirect',
    () => {
      if (Electron.isElectron()) return;
      if (!shouldTryDesktop) return;
      setLoading(true);
      try {
        const path = window.location.href.replace(/^https?/, 'tdrive');
        detectDesktopAppPresence(path).then(isDesktopAppPresent => {
          setLoading(false);
          if (isDesktopAppPresent) {
            setUseWeb(false);
            return;
          }
          setUseWeb(true);
        });
      } catch (e) {
        setUseWeb(true);
      }
    },
    [user?.id],
  );

  return (
    <>
      {!!useWeb && !loading && children}
      {!useWeb && (
        <div className="bg-white h-full overflow-hidden fixed top-0 left-0 w-full z-50">
          <OpenDesktopPopup />
        </div>
      )}
      {loading && (
        <div className="bg-white h-full overflow-hidden fixed top-0 left-0 w-full z-50">
          <Loader className="h-8 w-8 absolute m-auto left-0 right-0 top-0 bottom-0" />
        </div>
      )}
    </>
  );
};
