import React, { Component } from 'react';

import Languages from 'app/features/global/services/languages-service';
import LoginService from 'app/features/auth/login-service';
import AccountService from 'app/deprecated/login/account';
import Emojione from 'components/emojione/emojione';
import WindowState from 'app/features/global/utils/window';

export default class VerifyMail extends Component {
  constructor() {
    super();

    this.state = {
      login: LoginService,
      i18n: Languages,
      status: 'pending',
    };
    LoginService.addListener(this);
    Languages.addListener(this);
  }
  componentDidMount() {
    AccountService.doVerifyMail(
      WindowState.findGetParameter('m'),
      WindowState.findGetParameter('c'),
      WindowState.findGetParameter('token'),
      () => {
        this.setState({ status: 'success' });
        document.location.replace('/');
        LoginService.init();
      },
      () => {
        this.setState({ status: 'error' });
      },
    );
  }
  componentWillUnmount() {
    LoginService.removeListener(this);
    Languages.removeListener(this);
  }
  render() {
    return (
      <div className="verify_mail">
        <div className="center_box_container login_view fade_in">
          <div className="center_box white_box_with_shadow" style={{ width: '400px' }}>
            <div className="title">
              {Languages.t('scenes.login.verifymail.alert', [], 'Nous vérifions votre e-mail !')}
            </div>

            {this.state.status === 'pending' && (
              <div className="subtitle">
                <Emojione type=":hourglass:" />{' '}
                {Languages.t(
                  'scenes.login.verifymail.verification_waiting',
                  [],
                  'En attente de vérification...',
                )}
              </div>
            )}

            {this.state.status === 'success' && [
              <div className="subtitle" key='scenes.login.verifymail.success'>
                <Emojione type=":white_check_mark:" />{' '}
                {Languages.t(
                  'scenes.login.verifymail.success',
                  [],
                  'Votre e-mail a été vérifié avec succès!',
                )}
              </div>,
              // eslint-disable-next-line jsx-a11y/anchor-is-valid
              <a href="#" onClick={() => (document.location = '/')} className="blue_link" key="scenes.login.verifymail.signin_button">
                {Languages.t('scenes.login.verifymail.signin_button', [], 'Se connecter')}
              </a>,
            ]}

            {this.state.status === 'error' && [
              <div className="subtitle" key="scenes.login.verifymail.error_message">
                <Emojione type=":confused:" />{' '}
                {Languages.t(
                  'scenes.login.verifymail.error_message',
                  [],
                  "Une erreur s'est produite",
                )}
              </div>,
              // eslint-disable-next-line jsx-a11y/anchor-is-valid
              <a
                key="scenes.login.home.create_account"
                onClick={() => {
                  LoginService.changeState('signin');
                  document.location.replace('/');
                }}
                className="blue_link"
              >
                {this.state.i18n.t('scenes.login.home.create_account')}
              </a>,
            ]}
          </div>
        </div>
      </div>
    );
  }
}
