import React, { useEffect } from 'react';
import { Typography } from 'antd';

import Globals from '@features/global/services/globals-tdrive-app-service';
import Languages from '@features/global/services/languages-service';
import InitService from '@features/global/services/init-service';
import LoginService from '@features/auth/login-service';
import Icon from '@components/icon/icon.jsx';

import LoginView from './login-view/login-view';
import Signin from './signin/signin.jsx';
import Error from './error';

import './login.scss';

export default () => {
  LoginService.useListener();
  Languages.useListener();
  const [server_infos_loaded, server_infos] = InitService.useWatcher(() => [
    InitService.server_infos_loaded,
    InitService.server_infos,
  ]);

  useEffect(() => {
    LoginService.init();
    document.body.classList.remove('fade_out');
    document.body.classList.add('fade_in');
    return () => {
      document.body.classList.remove('fade_in');
    };
  }, []);

  if (!server_infos_loaded) {
    return <div />;
  }

  return (
    <div className="loginPage">
      {server_infos_loaded && !server_infos?.configuration?.branding?.name && (
        <div className="tdrive_logo" />
      )}

      {LoginService.state === 'error' && <Error />}
      {LoginService.state === 'logged_out' && <LoginView />}
      {LoginService.state === 'signin' && <Signin />}

      <div className={'app_version_footer '}>
        <div className="version_name fade_in">Tdrive {Globals.version.version_name}</div>
        <div style={{ height: 20 }}>
          {server_infos_loaded && server_infos?.configuration?.branding?.name && (
            <div className="smalltext fade_in">
              {server_infos?.configuration?.branding?.name &&
                Languages.t('scenes.login.footer.branding', [
                  server_infos?.configuration?.branding?.name,
                  server_infos?.configuration?.branding.link || 'tdrive.app',
                ])}
              <Typography.Link onClick={() => window.open('https://tdriveapp.com', 'blank')}>
                {Languages.t('scenes.login.footer.go_to_tdrive')}
              </Typography.Link>
              {' - ' + Globals.version.version}
            </div>
          )}
          {server_infos_loaded && !server_infos?.configuration?.branding?.name && (
            <Typography.Link
              className="fade_in"
              onClick={() => window.open('https://tdriveapp.com', 'blank')}
            >
              {Languages.t('scenes.login.footer.go_to_tdrive')}
            </Typography.Link>
          )}
        </div>
      </div>

      <div className={'help_footer'}>
        {server_infos_loaded && server_infos?.configuration?.help_url && (
          <Typography.Link
            onClick={() =>
              window.open(InitService.server_infos?.configuration?.help_url || '', 'blank')
            }
            className="blue_link fade_in"
          >
            <Icon type="question-circle" /> {Languages.t('general.help')}
          </Typography.Link>
        )}
      </div>
    </div>
  );
};
