/* eslint-disable react/no-direct-mutation-state */
import React, { Component } from 'react';

import Languages from 'app/features/global/services/languages-service';
import WorkspaceService from 'app/deprecated/workspaces/workspaces.jsx';
import GroupService from 'app/deprecated/workspaces/groups.js';
import popupManager from 'app/deprecated/popupManager/popupManager.js';
import Emojione from 'components/emojione/emojione';
import ButtonWithTimeout from 'components/buttons/button-with-timeout.jsx';
import Input from 'components/inputs/input.jsx';
import AddUserByEmail from 'app/views/client/popup/AddUser/AddUserByEmail';
import './CreateWorkspacePage.scss';

export default class CreateWorkspacePage extends Component {
  constructor() {
    super();

    this.state = {
      i18n: Languages,
      workspaces: WorkspaceService,
      page: 1,
      name: '',
      members: [],
      willClose: false,
    };
    Languages.addListener(this);
    WorkspaceService.addListener(this);
  }
  componentDidMount() {
    if (this.input) {
      this.input.focus();
    }
  }
  componentWillUnmount() {
    Languages.removeListener(this);
    WorkspaceService.removeListener(this);
  }
  displayStep() {
    if (this.state.page === 1) {
      return (
        <div className="">
          <div className="subtitle">
            {Languages.t(
              'scenes.app.popup.createworkspacepage.add_subtitle',
              [],
              'Besoin de plus de place ? Un nouvel espace de travail et ce sera parfait !',
            )}{' '}
            <Emojione type=":grin:" />
          </div>
          <br />
          <Input
            refInput={ref => {
              this.input = ref;
            }}
            className="full_width"
            big
            onKeyDown={e => {
              if (e.keyCode === 13 && this.state.name.length > 0) {
                this.next();
              }
            }}
            placeholder={Languages.t(
              'scenes.app.popup.createworkspacepage.placeholder_name',
              [],
              "Nom de l'espace de travail",
            )}
            value={this.state.name}
            onChange={evt => this.setState({ name: evt.target.value })}
          />
          <div className="bottom">
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a href="#" className="returnBtn blue_link" onClick={() => this.previous()}>
              {this.state.i18n.t('general.back')}
            </a>
            <ButtonWithTimeout
              className="medium"
              disabled={this.state.name.length <= 0 || this.state.workspaces.loading}
              onClick={() => this.next()}
              loading={this.state.workspaces.loading}
              value={this.state.i18n.t('general.continue')}
            />
          </div>
        </div>
      );
    }
    if (this.state.page === 2) {
      return (
        <AddUserByEmail
          inline
          onChange={members => {
            this.state.members = members;
            this.setState({ members });
            this.setState({});
          }}
          previous={() => this.previous()}
          finish={() => this.next()}
          loading={this.state.workspaces.loading}
          noMagicLink
        />
      );
    }
  }
  previous() {
    if (this.state.page <= 1) {
      popupManager.close();
    } else {
      this.setState({ page: this.state.page - 1 });
    }
  }
  next() {
    if (this.state.page >= 2) {
      if (!this.did_create_workspace) {
        this.did_create_workspace = true;
        WorkspaceService.createWorkspace(
          this.state.name,
          this.state.members || [],
          GroupService.currentGroupId,
        );
      }
    } else {
      this.setState({ page: this.state.page + 1 });
    }
  }
  close() {
    this.setState({ willClose: true });
    setTimeout(() => {
      WorkspaceService.closeCreateWorkspacePage();
    }, 200);
  }
  render() {
    return (
      <div className={'createWorkspaceView'}>
        <div
          className={
            'center_box_container login_view ' + (this.state.willClose ? 'fade_out ' : 'fade_in ')
          }
        >
          <div className="center_box ">
            {/*<StepCounter total={1} current={this.state.page} />*/}
            <div className="title">
              {Languages.t(
                'scenes.app.popup.createworkspacepage.create_new_workspace',
                [],
                'Créer un nouvel espace de travail',
              )}
              {/* {this.state.page}/1*/}
            </div>
            {this.displayStep()}
          </div>
        </div>
      </div>
    );
  }
}
