/* eslint-disable react/jsx-key */
import React, { Component } from 'react';

import Languages from 'app/features/global/services/languages-service';
import AlertManager from 'app/features/global/services/alert-manager-service';
import Input from 'components/inputs/input.jsx';
import Button from 'components/buttons/button.jsx';
import MediumPopupManager from 'app/components/modal/modal-manager';
import {
  ObjectModal,
  ObjectModalFormTitle,
  ObjectModalTitle,
} from 'components/object-modal/deprecated-object-modal.jsx';
import Api from 'app/features/global/framework/api-service';
import Workspaces from 'app/deprecated/workspaces/workspaces.jsx';
import './pages.scss';

export default class CreateCompanyAccount extends Component {
  constructor() {
    super();
    this.state = {
      password: '',
      fullname: '',
    };
    Languages.addListener(this);
  }

  componentWillUnmount() {
    Languages.removeListener(this);
  }

  save() {
    if (!(this.state.password || '').trim() || (this.state.password || '').length < 8) {
      return;
    }

    MediumPopupManager.closeAll();

    var data = {
      mail: this.props.email,
      fullname: this.state.fullname,
      password: this.state.password,
      language: Languages.language,
      workspace_id: Workspaces.currentWorkspaceId,
    };
    Api.post('/ajax/users/subscribe/company_subscribe', data, res => {
      if ((res || {}).data == 'success') {
        AlertManager.alert(() => {}, {
          title: 'Account created',
          text: (
            <div className="allow_selection">
              <b>Login:</b> {this.props.email}
              <br />
              <b>Password:</b> {this.state.password}
              <br />
              <span className="text">
                {Languages.t(
                  'scenes.apps.account.account.send_info',
                  [],
                  'Send this information to your member to let him now its new credentials.',
                )}
              </span>
            </div>
          ),
        });
      } else {
        AlertManager.alert(() => {}, {
          title: 'An error occurred',
          text: Languages.t('scenes.app.popup.createcompany.try_again', [], 'Please try again.'),
        });
      }
    });
  }
  render() {
    return (
      <div className="">
        <ObjectModal
          className="create_company_account_modal "
          onClose={() => MediumPopupManager.closeAll()}
          footer={
            <div>
              <Button
                className="secondary-light small right-margin"
                style={{ width: 'auto' }}
                onClick={() => {
                  MediumPopupManager.closeAll();
                }}
              >
                {Languages.t('general.cancel', [], 'Cancel')}
              </Button>

              <Button
                className="small primary"
                style={{ width: 'auto', float: 'right' }}
                onClick={() => {
                  this.save();
                }}
              >
                {Languages.t('scenes.apps.account.account.save', [], 'Save account')}
              </Button>
            </div>
          }
          title={
            <ObjectModalTitle>
              {this.props.edit
                ? Languages.t('scenes.app.popup.workspace.edit_temp', [], 'Edit temporary account')
                : Languages.t(
                    'scenes.app.popup.workspace.create_temp',
                    [],
                    'Create temporary account',
                  )}
            </ObjectModalTitle>
          }
        >
          <span className="text">
            {Languages.t(
              'scenes.apps.account.message_temporary',
              [],
              'A temporary account works like a normal Tdrive account, but you generate its password and you will be able to reset it if necessary.',
            )}
            <br />
            {Languages.t(
              'scenes.apps.account.message_user_signin',
              [],
              'Your user can sign in at anytime using this same email and change its temporary account to a normal account.',
            )}
          </span>

          {!this.props.edit && [
            <ObjectModalFormTitle
              icon="user"
              name={Languages.t('scenes.apps.account.account.fullname', [], 'Fullname')}
            />,
            <Input
              className="full_width"
              placeholder="John Snow"
              onChange={e => this.setState({ fullname: e.target.value })}
            />,
          ]}

          <ObjectModalFormTitle
            icon="envelope"
            name={Languages.t('login.email_login', [], 'Email / Login')}
          />
          <Input className="full_width" disabled value={this.props.email} />

          <ObjectModalFormTitle
            icon="lock"
            name={Languages.t('scenes.apps.account.account.password', [], 'Password')}
          />
          <Input
            className="full_width"
            placeholder={Languages.t(
              'scenes.apps.account.account.password_for_user',
              [],
              'Password for your user',
            )}
            onChange={e => this.setState({ password: e.target.value })}
          />

          <br />
          <br />
          <span className="text">
            {Languages.t(
              'scenes.login.create_account.too_short_password',
              [],
              'Your password must contain at least 8 characters.',
            )}
          </span>

          <br />
          <br />
        </ObjectModal>
      </div>
    );
  }
}
