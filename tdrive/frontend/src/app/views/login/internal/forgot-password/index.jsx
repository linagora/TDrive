import React, { Component } from 'react';

import Languages from 'app/features/global/services/languages-service';
import LoginService from 'app/features/auth/login-service';
import AccountService from 'app/deprecated/login/account.js';
import Emojione from 'components/emojione/emojione';
import StepCounter from 'components/step-counter/step-counter.jsx';
import ButtonWithTimeout from 'components/buttons/button-with-timeout.jsx';
import Input from 'components/inputs/input.jsx';
import { Typography } from 'antd';

export default class ForgotPassword extends Component {
  constructor() {
    super();

    this.state = {
      login: LoginService,
      i18n: Languages,
      email: '',
      password1: '',
      password2: '',
      code: '',
      page: 1,

      invalidForm: false,
      patternRegMail: new RegExp(
        "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?",
      ),
      mailAvailable: true,
      usernameAvailable: true,
      errorPassword: false,
      errorCode: false,
    };
    LoginService.addListener(this);
    Languages.addListener(this);
  }
  componentDidMount() {
    if (this.input) {
      this.input.focus();
    }
  }
  componentWillUnmount() {
    LoginService.removeListener(this);
    Languages.removeListener(this);
  }
  componentDidUpdate(_prevProps, prevState) {
    if (prevState.page === this.state.page - 1 || prevState.page === this.state.page + 1) {
      if (this.input) {
        this.input.focus();
      }
      if (this.inputcode) {
        this.inputcode.focus();
      }
      if (this.inputpassword) {
        this.inputpassword.focus();
      }
    }
  }
  displayStep() {
    if (this.state.page === 1) {
      return (
        <div className="">
          <div className="subtitle">{this.state.i18n.t('scenes.login.forgot_password.text')}</div>

          <Input
            refInput={ref => {
              this.input = ref;
            }}
            type="text"
            className={
              'bottom-margin full_width big ' +
              (this.state.login.error_recover_nosuchmail ? 'error' : '')
            }
            onKeyDown={e => {
              if (e.keyCode === 13 && this.checkForm() && !this.state.login.login_loading) {
                this.next();
              }
            }}
            value={this.state.email}
            id="email_to_recover"
            placeholder={this.state.i18n.t('scenes.login.forgot_password.email_to_recover')}
            onChange={evt => this.setState({ email: evt.target.value })}
          />

          {this.state.login.error_recover_nosuchmail && (
            <span className="text error">
              {this.state.i18n.t('scenes.login.forgot_password.mail_doesnt_exist')}
            </span>
          )}

          <div className="bottom">
            <Typography.Link onClick={() => this.previous()}>
              {this.state.i18n.t('general.back')}
            </Typography.Link>
            <ButtonWithTimeout
              id="continue3_btn"
              className="medium"
              disabled={!this.checkForm() || this.state.login.login_loading}
              onClick={() => this.next()}
              value={this.state.i18n.t('general.continue')}
              loading={this.state.login.login_loading}
              loadingTimeout={2000}
            />
          </div>
        </div>
      );
    }
    if (this.state.page === 2) {
      return (
        <div className="">
          <div className="subtitle">
            {this.state.i18n.t('scenes.login.forgot_password.text2')} <Emojione type=":mailbox:" />
          </div>

          <Input
            refInput={ref => {
              this.inputcode = ref;
            }}
            id="code"
            type="text"
            onKeyDown={e => {
              if (
                e.keyCode === 13 &&
                this.state.code.length > 0 &&
                this.checkForm() &&
                !this.state.login.login_loading
              ) {
                this.next();
              }
            }}
            placeholder={'123-456-789'}
            value={this.state.code}
            onChange={evt => this.setState({ code: evt.target.value })}
            className={
              'bottom-margin full_width big ' +
              (this.state.login.error_recover_badcode ? 'error' : '')
            }
            style={{ textAlign: 'center' }}
          />
          <br />
          {this.state.login.error_recover_badcode && (
            <span id="invalid_code_information" className="text error">
              {this.state.i18n.t('scenes.login.forgot_password.invalid_code')}
            </span>
          )}

          <div className="bottom">
            <Typography.Link onClick={() => this.previous()}>
              {this.state.i18n.t('general.back')}
            </Typography.Link>
            <ButtonWithTimeout
              id="continue4_btn"
              className="medium"
              disabled={!this.checkForm() || this.state.login.login_loading}
              onClick={() => this.next()}
              value={this.state.i18n.t('general.continue')}
              loading={this.state.login.login_loading}
              loadingTimeout={2000}
            />
          </div>
        </div>
      );
    }
    if (this.state.page === 3) {
      this.checkForm();
      return (
        <div className="">
          <div className="subtitle">{this.state.i18n.t('scenes.login.forgot_password.text3')}</div>

          <Input
            refInput={ref => {
              this.inputpassword = ref;
            }}
            type="password"
            onKeyDown={e => {
              if (e.keyCode === 13 && this.checkForm() && !this.state.login.login_loading) {
                this.next();
              }
            }}
            placeholder={this.state.i18n.t('scenes.login.forgot_password.password')}
            value={this.state.password1}
            onChange={evt => this.setState({ password1: evt.target.value })}
            className={
              'bottom-margin full_width medium ' +
              ((this.state.errorPasswordDoesNotMatch || this.state.errorPassword) &&
              this.state.password1.length
                ? 'error'
                : '')
            }
          />

          <Input
            type="password"
            onKeyDown={e => {
              if (e.keyCode === 13 && this.checkForm() && !this.state.login.login_loading) {
                this.next();
              }
            }}
            placeholder={this.state.i18n.t('scenes.login.forgot_password.password2')}
            value={this.state.password2}
            onChange={evt => this.setState({ password2: evt.target.value })}
            className={
              'bottom-margin full_width medium ' +
              ((this.state.errorPasswordDoesNotMatch || this.state.errorPassword) &&
              this.state.password1.length
                ? 'error'
                : '')
            }
          />

          {(this.state.login.error_recover_badpasswords ||
            this.state.login.error_recover_unknown ||
            this.state.errorPasswordDoesNotMatch ||
            this.state.errorPassword) &&
            this.state.password1.length > 0 && (
              <span className="text error">
                {this.state.i18n.t('scenes.login.forgot_password.password_dont_match')}
              </span>
            )}

          <div className="bottom">
            <Typography.Link onClick={() => this.previous()}>
              {this.state.i18n.t('general.back')}
            </Typography.Link>
            <ButtonWithTimeout
              className="medium"
              disabled={
                this.state.errorPasswordDoesNotMatch ||
                this.state.errorPassword ||
                this.state.password1.length === 0 ||
                this.state.login.login_loading
              }
              onClick={() => this.next()}
              value={this.state.i18n.t('general.continue')}
              loading={this.state.login.login_loading}
              loadingTimeout={2000}
            />
          </div>
        </div>
      );
    }
    if (this.state.page === 4) {
      return (
        <div className="">
          <div className="subtitle">
            {this.state.i18n.t('scenes.login.forgot_password.finished')}{' '}
            <Emojione type=":raised_hands:" />
          </div>

          <div className="bottom">
            <ButtonWithTimeout
              className="medium"
              disabled={this.state.exiting}
              onClick={() => {
                this.setState({ exiting: true });
                this.next();
              }}
              value={this.state.i18n.t('general.continue')}
              loading={this.state.login.login_loading}
              loadingTimeout={2000}
            />
          </div>
        </div>
      );
    }
  }
  checkForm() {
    if (this.state.password1.length < 8) {
      this.setState({ errorPassword: true });
    } else {
      this.setState({ errorPassword: false });
    }

    if (this.state.password1 !== this.state.password2) {
      this.setState({ errorPasswordDoesNotMatch: true });
    } else {
      this.setState({ errorPasswordDoesNotMatch: false });
    }

    return (
      this.state.patternRegMail.test(this.state.email.toLocaleLowerCase()) &&
      this.state.email.length > 0
    );
  }
  previous() {
    if (this.state.page <= 1) {
      this.state.login.changeState('logged_out');
    } else {
      this.setState({ page: this.state.page - 1 });
    }
  }
  next() {
    if (this.state.page === 1) {
      if (this.checkForm()) {
        AccountService.recover(this.state.email, () => {
          this.setState({ page: this.state.page + 1 });
        });
      }
    } else if (this.state.page === 2) {
      if (this.checkForm()) {
        AccountService.recoverCode(this.state.code, () => {
          this.setState({ page: this.state.page + 1 });
        });
      }
    } else if (this.state.page === 3) {
      if (this.checkForm()) {
        AccountService.recoverNewPassword(this.state.password1, this.state.password2, () => {
          this.setState({ page: this.state.page + 1 });
        });
      }
    } else if (this.state.page === 4) {
      this.state.login.init();
    } else {
      this.setState({ page: this.state.page + 1 });
    }
  }
  render() {
    return (
      <div className="forgotPassword">
        <div className="center_box_container login_view fade_in">
          <div className="center_box white_box_with_shadow" style={{ width: '400px' }}>
            <StepCounter total={4} current={this.state.page} />
            <div className="title">
              {this.state.i18n.t('scenes.login.forgot_password.title')} {this.state.page}/4
            </div>
            {this.displayStep()}
          </div>
        </div>
      </div>
    );
  }
}
