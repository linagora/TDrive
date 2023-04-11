/* eslint-disable react/prop-types */
import React, { Component } from 'react';

import Languages from 'app/features/global/services/languages-service';
import Collections from 'app/deprecated/CollectionsV1/Collections/Collections.js';
import LoginService from 'app/features/auth/login-service';
import popupManager from 'app/deprecated/popupManager/popupManager.js';
import userService from 'app/features/users/services/current-user-service';
import currentUserService from 'app/deprecated/user/CurrentUser';
import CompanyIntegration from './Pages/CompanyIntegrations';
import WorkspacePartner from './Pages/WorkspacePartner';
import CompanyIdendity from './Pages/CompanyIdendity.jsx';
import WorkspaceUserRights from 'app/features/workspaces/services/workspace-user-rights-service';
import WorkspaceService from 'app/deprecated/workspaces/workspaces.jsx';
import MenuList from 'components/menus/menu-component.jsx';
import InitService from 'app/features/global/services/init-service';
import ConsoleService from 'app/features/console/services/console-service';

import './WorkspaceParameter.scss';
import WorkspaceIdentity from './Pages/Workspace/WorkspaceIdentity';

export default class WorkspaceParameter extends Component {
  constructor(props) {
    super(props);
    var user = Collections.get('users').find(userService.getCurrentUserId());
    this.state = {
      login: LoginService,
      i18n: Languages,
      users_repository: Collections.get('users'),
      workspace_user_rights: WorkspaceUserRights,
      currentUserService: currentUserService,
      page: popupManager.popupStates['workspace_parameters'] || props.initial_page || 1,
      attributeOpen: 0,
      subMenuOpened: 0,
      username: user ? user.username : '',
      last_name: user ? user.last_name : '',
      first_name: user ? user.first_name : '',
      thumbnail: false,
      options: this.props.options,
    };
    Collections.get('users').addListener(this);
    Collections.get('users').listenOnly(this, [
      Collections.get('users').find(userService.getCurrentUserId()).front_id,
    ]);
    LoginService.addListener(this);
    Languages.addListener(this);
    currentUserService.addListener(this);
  }
  UNSAFE_componentWillMount() {
    this.setState({ thumbnail: false });
  }
  componentWillUnmount() {
    LoginService.removeListener(this);
    Languages.removeListener(this);
    currentUserService.removeListener(this);
    Collections.get('users').removeListener(this);
  }
  displayScene() {
    if (WorkspaceUserRights.hasWorkspacePrivilege() && this.state.page === 1) {
      return <WorkspaceIdentity />;
    }
    if (this.state.page === 2) {
      return <WorkspacePartner />;
    }
    if (WorkspaceUserRights.hasWorkspacePrivilege() && this.state.page === 3) {
      return <CompanyIntegration />;
    }
    if (WorkspaceUserRights.hasGroupPrivilege('MANAGE_DATA') && this.state.page === 4) {
      return <CompanyIdendity />;
    }
    if (this.state.page === 5) {
      return (
        <div className="">
          <div className="title">
            {Languages.t(
              'scenes.app.popup.workspaceparameter.payments_subscriptions_title',
              [],
              'Paiements et abonnements',
            )}
          </div>

          <div className="group_section" />
        </div>
      );
    }
  }

  setPage(page) {
    popupManager.popupStates['workspace_parameters'] = page;
    this.setState({ page: page });
  }
  render() {
    var subText = (
      <div>
        {Languages.t(
          'scenes.app.channelsbar.currentuser.workspace_info',
          [
            Collections.get('workspaces').find(WorkspaceService.currentWorkspaceId).name,
            Collections.get('groups').find(WorkspaceService.currentGroupId).name,
          ],
          "Vous êtes dans l'espace de travail $1 du groupe $2.",
        )}
        <br />
        <br />
        {WorkspaceUserRights.hasWorkspacePrivilege() &&
          WorkspaceUserRights.hasGroupPrivilege('MANAGE_PRICINGS') && (
            <span>
              {Languages.t(
                'scenes.app.popup.workspaceparameter.admin_manager_current_status',
                [],
                "Vous êtes Administrateur et Gérant de l'entreprise.",
              )}
            </span>
          )}
        {WorkspaceUserRights.hasWorkspacePrivilege() &&
          !WorkspaceUserRights.hasGroupPrivilege('MANAGE_PRICINGS') && (
            <span>
              {Languages.t(
                'scenes.app.popup.workspaceparameter.admin_current_status',
                [],
                'Vous êtes Administrateur.',
              )}
            </span>
          )}
        {!WorkspaceUserRights.hasWorkspacePrivilege() &&
          WorkspaceUserRights.hasGroupPrivilege('MANAGE_PRICINGS') && (
            <span>
              {Languages.t(
                'scenes.app.popup.workspaceparameter.manager_current_status',
                [],
                "Vous êtes Gérant de l'entreprise.",
              )}
            </span>
          )}
      </div>
    );

    var menu = [];

    if (WorkspaceUserRights.hasWorkspacePrivilege()) {
      menu.push({
        type: 'menu',
        emoji: ':house_with_garden:',
        text: Languages.t(
          'scenes.apps.parameters.workspace_sections.workspace',
          [],
          'Espace de travail',
        ),
        selected: this.state.page === 1 ? 'selected' : '',
        onClick: () => {
          this.setPage(1);
        },
      });
      menu.push({
        type: 'menu',
        emoji: ':electric_plug:', // WORKSPACE INTEGRATION
        text: Languages.t('scenes.app.popup.workspaceparameter.pages.apps_connectors_title'),
        selected: this.state.page === 3 ? 'selected' : '',
        onClick: () => {
          this.setPage(3);
        },
      });
    }
    menu.push({
      type: 'menu',
      emoji: ':handshake:',
      text: Languages.t(
        'scenes.app.popup.workspaceparameter.pages.collaborateurs',
        [],
        'Collaborateurs',
      ),
      selected: this.state.page === 2 ? 'selected' : '',
      onClick: () => {
        this.setPage(2);
      },
    });

    if (WorkspaceUserRights.hasGroupPrivilege('MANAGE_DATA')) {
      menu.push({ type: 'separator' });
      menu.push({
        type: 'menu',
        emoji: ':clipboard:',
        text: Languages.t(
          'scenes.app.popup.workspaceparameter.pages.company_identity_title',
          [],
          "Identité de l'entreprise",
        ),
        selected: this.state.page === 4 ? 'selected' : '',
        onClick: () => {
          if (InitService.server_infos?.configuration?.accounts?.type === 'remote') {
            return window.open(
              ConsoleService.getCompanyManagementUrl(WorkspaceService.currentGroupId),
              '_blank',
            );
          } else {
            this.setPage(4);
          }
        },
      });
    }

    menu.push({ type: 'text', text: subText });

    return (
      <div className="workspaceParameter fade_in">
        <div className="main">
          <div className="sideBar">
            <MenuList menu={menu} />
          </div>
          <div className="content">{this.displayScene()}</div>
        </div>
      </div>
    );
  }
}
