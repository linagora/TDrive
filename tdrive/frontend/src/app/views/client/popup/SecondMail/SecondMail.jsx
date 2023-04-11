/* eslint-disable react/jsx-key */
import React, { Component } from 'react';

import Languages from 'app/features/global/services/languages-service';
import Collections from 'app/deprecated/CollectionsV1/Collections/Collections.js';
import WorkspaceService from 'app/deprecated/workspaces/workspaces.jsx';
import userService from 'app/features/users/services/current-user-service';
import loginService from 'app/features/auth/login-service';
import AccountService from 'app/deprecated/login/account';
import popupManager from 'app/deprecated/popupManager/popupManager.js';
import ButtonWithTimeout from 'components/buttons/button-with-timeout.jsx';
import Input from 'components/inputs/input.jsx';
import './SecondMail.scss';

export default class SecondMail extends Component {
  /*
        props : {
            onReturn  : function
        }
    */
  constructor() {
    super();
    this.state = {
      i18n: Languages,
      workspaceService: WorkspaceService,
      users_repository: Collections.get('users'),
      loginService: loginService,
      mail: '',
      code: '',
      page: 1,
    };
    Collections.get('users').addListener(this);
    Collections.get('users').listenOnly(this, [
      Collections.get('users').find(userService.getCurrentUserId()).front_id,
    ]);
    loginService.addListener(this);
    Languages.addListener(this);
    WorkspaceService.addListener(this);
  }
  componentDidMount() {
    if (this.input) {
      this.input.focus();
    }
  }
  componentWillUnmount() {
    Collections.get('users').removeListener(this);
    loginService.removeListener(this);
    Languages.removeListener(this);
    WorkspaceService.removeListener(this);
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevState.page === 1 && this.state.page === 2 && this.input) {
      this.input.focus();
    }
    if (prevState.page === 2 && this.state.page === 1 && this.input) {
      this.input.focus();
    }
  }
  displayStep() {
    if (this.state.page === 1) {
      return (
        <div className="secondMail center_box">
          <div className="title">
            {this.state.i18n.t('scenes.app.workspaces.welcome_page.add_secondary_emails')}
          </div>
          <div className="subtitle">
            {this.state.i18n.t('scenes.app.workspaces.welcome_page.add_secondary_emails_comment')}
          </div>
          <div className="mails">
            <div className="mainMail mail">
              <div className="littleTittle">
                {this.state.i18n.t('scenes.app.workspaces.welcome_page.main_mail_title')}
              </div>
              <div className="mailAdress">
                {
                  this.state.users_repository
                    .find(userService.getCurrentUserId())
                    .mails.find(function (element) {
                      return element.main;
                    }).email
                }
              </div>
            </div>
            <div className="mainMail mail">
              <div className="littleTittle">
                {this.state.i18n.t('scenes.app.workspaces.welcome_page.other_mail_title')}
              </div>
              {this.state.users_repository.find(userService.getCurrentUserId()).mails.map(item => {
                if (item.main) {
                  return '';
                }
                return <div className="mailAdress">{item.email}</div>;
              })}
              <Input
                className={
                  'full_width ' +
                  (this.state.loginService.error_secondary_mail_already ? 'error' : '')
                }
                refInput={ref => {
                  this.input = ref;
                }}
                type="text"
                onKeyDown={e => {
                  if (e.keyCode === 13 && this.state.mail.length > 0) {
                    this.next();
                  }
                }}
                placeholder={this.state.i18n.t('scenes.app.workspaces.welcome_page.new_email')}
                value={this.state.mail}
                onChange={evt => this.setState({ mail: evt.target.value })}
              />
              {this.state.loginService.error_secondary_mail_already && (
                <span id="errorUsernameExist" className={'text error'}>
                  {this.state.i18n.t('scenes.login.create_account.email_used')}
                </span>
              )}
            </div>
          </div>
          <div className="bottom">
            <div className="return">
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a href="#" className="blue_link" onClick={() => this.previous()}>
                {this.state.i18n.t('scenes.app.workspaces.welcome_page.done')}
              </a>
            </div>
            <ButtonWithTimeout
              className="medium"
              disabled={this.state.loginService.loading}
              onClick={() => this.next()}
              value={this.state.i18n.t('scenes.app.workspaces.welcome_page.add_new_email')}
              loading={this.state.loginService.loading}
              loadingTimeout={1500}
            />
          </div>
        </div>
      );
    }
    if (this.state.page === 2) {
      return (
        <div className="secondMail center_box">
          <div className="title">
            {this.state.i18n.t('scenes.app.workspaces.welcome_page.add_secondary_emails')}
          </div>
          <div className="subtitle">
            {this.state.i18n.t('scenes.app.workspaces.welcome_page.we_sent_you_mail', [
              this.state.mail,
            ])}
          </div>
          <div className="mails">
            <div className="code">
              <div className="littleTittle">
                {this.state.i18n.t('scenes.app.workspaces.welcome_page.code_verification')}
              </div>
              <Input
                refInput={ref => {
                  this.input = ref;
                }}
                type="text"
                onKeyDown={e => {
                  if (e.keyCode === 13 && this.state.code.length > 0) {
                    this.next();
                  }
                }}
                placeholder={'123-456-789'}
                onChange={evt => this.setState({ code: evt.target.value })}
                className={
                  this.state.loginService.error_code || this.state.error_code ? 'error' : ''
                }
                style={{ maxWidth: '200px', textAlign: 'center' }}
              />

              {(this.state.loginService.error_code || this.state.error_code) && (
                <span id="errorUsernameExist" className={'text error'} style={{ display: 'block' }}>
                  {this.state.i18n.t('scenes.apps.account.account.email_add_modal.invalid_code')}
                </span>
              )}
            </div>
          </div>
          <div className="bottom">
            <div className="return">
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a href="#" className="blue_link" onClick={() => this.previous()}>
                {this.state.i18n.t('general.back')}
              </a>
            </div>
            <ButtonWithTimeout
              className="medium"
              disabled={this.state.loginService.loading}
              onClick={() => this.next()}
              value={this.state.i18n.t('general.confirm')}
              loading={this.state.loginService.loading}
              loadingTimeout={1500}
            />
          </div>
        </div>
      );
    }
    return '';
  }
  previous() {
    if (this.state.page <= 1) {
      this.props.onReturn();
      popupManager.close();
    } else {
      this.setState({ page: this.state.page - 1 });
    }
  }
  next() {
    if (this.state.page === 2) {
      if (this.state.code) {
        AccountService.verifySecondMail(
          this.state.mail,
          this.state.code,
          thot => {
            thot.setState({ page: 1, mail: '', code: '' });
          },
          this,
        );
      }
    } else if (this.state.page === 1) {
      if (this.state.mail) {
        AccountService.addNewMail(this.state.mail, thot => thot.setState({ page: 2 }), this);
      }
    }
  }
  render() {
    return this.displayStep();
  }
}
