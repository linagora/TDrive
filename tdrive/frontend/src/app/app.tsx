// eslint-disable-next-line @typescript-eslint/no-use-before-define
import React, { useEffect, useState } from 'react';
import { Router } from 'react-router';
import { Switch, Route } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

import MobileRedirect from './components/mobile-redirect';
import RouterServices, { RouteType } from './features/router/services/router-service';
import ErrorBoundary from 'app/views/error/error-boundary';
import InitService from './features/global/services/init-service';
import useTimeout from 'app/features/global/hooks/use-timeout';
import ApplicationLoader from './components/loader/application-loader';

import DebugState from './components/debug/debug-state';
import 'app/styles/index.less';

const delayMessage = 5000;

export default () => {
  const [displayDelayLoader, setDisplayDelayLoader] = useState(false);
  const [firstRenderDate] = useState(Date.now());

  useEffect(() => {
    InitService.init();
  }, []);

  const server_infos_loaded = InitService.useWatcher(() => InitService.server_infos_loaded);

  useTimeout(() => {
    if (!server_infos_loaded && Date.now() >= firstRenderDate + delayMessage) {
      setDisplayDelayLoader(true);
    }
  }, delayMessage);

  useEffect(() => {
    if (server_infos_loaded) {
      setDisplayDelayLoader(false);
      try {
        window.document.getElementById('app_loader')?.remove();
      } catch (err) {
        //Null
      }
    }
  }, [server_infos_loaded]);

  if (displayDelayLoader && !server_infos_loaded) {
    return <ApplicationLoader></ApplicationLoader>;
  }

  if (!server_infos_loaded) {
    return <></>;
  }

  return (
    <RecoilRoot>
      <DebugState />
      <MobileRedirect>
        <Router history={RouterServices.history}>
          <Switch>
            {RouterServices.routes.map((route: RouteType, index: number) => (
              <Route
                key={`${route.key}_${index}`}
                exact={route.exact ? route.exact : false}
                path={route.path}
                component={() =>
                  route.options?.withErrorBoundary ? (
                    <ErrorBoundary key={route.key}>
                      <route.component />
                    </ErrorBoundary>
                  ) : (
                    <route.component key={route.key} />
                  )
                }
              />
            ))}
            {
              <Route
                path="/"
                component={() => {
                  RouterServices.replace(
                    `${
                      RouterServices.pathnames.LOGIN
                    }?auto&${RouterServices.history.location.search.substr(1)}`,
                  );
                  return <div />;
                }}
              />
            }
          </Switch>
        </Router>
      </MobileRedirect>
    </RecoilRoot>
  );
};
