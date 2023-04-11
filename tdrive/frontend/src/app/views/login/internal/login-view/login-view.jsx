import React, { Component } from 'react';

import Languages from 'app/features/global/services/languages-service';
import LoginService from 'app/features/auth/login-service';
import Emojione from 'components/emojione/emojione';
import Button from 'components/buttons/button.jsx';
import Input from 'components/inputs/input.jsx';
import InitService from 'app/features/global/services/init-service';
import { Typography } from 'antd';
export default class LoginView extends Component {
  constructor() {
    super();

    this.state = {
      login: LoginService,
      i18n: Languages,
    };

    LoginService.addListener(this);
    Languages.addListener(this);
  }
  componentWillUnmount() {
    LoginService.removeListener(this);
    Languages.removeListener(this);
  }
  render() {
    if (
      InitService.server_infos?.configuration?.accounts?.type !== 'internal' &&
      !(LoginService.external_login_error || false)
    ) {
      return <></>;
    }

    return (
      <div className="center_box_container login_view fade_in">
        <div className="center_box white_box_with_shadow">
          <div className="title">
            {!((InitService.server_infos || {}).branding || {}).logo &&
              this.state.i18n.t('scenes.login.home.title')}
          </div>

          {!((InitService.server_infos || {}).branding || {}).logo && (
            <div className="subtitle" style={{ marginBottom: 24 }}>
              {this.state.i18n.t('scenes.login.home.subtitle')} <Emojione type=":innocent:" />
            </div>
          )}

          {!!((InitService.server_infos || {}).branding || {}).logo && (
            <img
              alt={((InitService.server_infos || {}).branding || {}).logo}
              style={{ marginBottom: 40, marginTop: 10, width: 140 }}
              src={((InitService.server_infos || {}).branding || {}).logo}
            />
          )}

          {this.state.login.external_login_error && (
            <div id="identification_information" className="smalltext error">
              Unable to login: {this.state.login.external_login_error}
            </div>
          )}

          {(Object.keys((InitService.server_infos || {}).auth || []).indexOf('internal') >= 0 ||
            ((InitService.server_infos || {}).auth || []).length === 0) && (
            <div className="internal-login">
              <Input
                id="username"
                type="text"
                className={
                  'bottom-margin medium full_width ' +
                  (this.state.login.login_error ? 'error ' : '')
                }
                placeholder={this.state.i18n.t('scenes.login.home.email')}
                onKeyDown={e => {
                  if (e.keyCode === 13 && !this.state.login.login_loading) {
                    LoginService.login({
                      username: this.state.form_login,
                      password: this.state.form_password,
                      remember_me: true,
                    });
                  }
                }}
                onChange={evt => this.setState({ form_login: evt.target.value })}
              />

              <Input
                id="password"
                type="password"
                className={
                  'bottom-margin medium full_width ' +
                  (this.state.login.login_error ? 'error ' : '')
                }
                placeholder={this.state.i18n.t('scenes.login.home.password')}
                onKeyDown={e => {
                  if (e.keyCode === 13 && !this.state.login.login_loading) {
                    LoginService.login({
                      username: this.state.form_login,
                      password: this.state.form_password,
                      remember_me: true,
                    });
                  }
                }}
                onChange={evt => this.setState({ form_password: evt.target.value })}
              />

              {this.state.login.login_error && (
                <div id="identification_information" className="smalltext error">
                  {this.state.i18n.t('scenes.login.home.unable_to_connect')}
                </div>
              )}

              <Button
                id="login_btn"
                type="button"
                className="medium full_width "
                style={{ marginBottom: 8 }}
                disabled={this.state.login.login_loading}
                onClick={() =>
                  LoginService.login({
                    username: this.state.form_login,
                    password: this.state.form_password,
                    remember_me: true,
                  })
                }
              >
                {this.state.i18n.t('scenes.login.home.login_btn')}
              </Button>
              {!InitService.server_infos?.configuration?.accounts?.internal
                ?.disable_account_creation && (
                <Typography.Link
                  onClick={() => this.state.login.changeState('signin')}
                  id="create_btn"
                  className="blue_link"
                >
                  {this.state.i18n.t('scenes.login.home.create_account')}
                </Typography.Link>
              )}
              {/*
              <Typography.Link
                onClick={() => this.state.login.changeState('forgot_password')}
                id="forgot_password_btn"
                className="blue_link"
              >
                {this.state.i18n.t('scenes.login.home.lost_password')}
              </Typography.Link>
              */}
            </div>
          )}
        </div>
      </div>
    );
  }
}
