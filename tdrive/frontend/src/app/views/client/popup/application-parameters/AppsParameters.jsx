import React, { Component } from 'react';

import Languages from 'app/features/global/services/languages-service';
import Collections from 'app/deprecated/CollectionsV1/Collections/Collections.js';
import LoginService from 'app/features/auth/login-service';
import popupManager from 'app/deprecated/popupManager/popupManager.js';
import userService from 'app/features/users/services/current-user-service';
import currentUserService from 'app/deprecated/user/CurrentUser';
import WorkspaceApps from './pages/WorkspaceApps.js.js.js.js.js.js.js';
import WorkspaceAppsInformations from './pages/WorkspaceAppsInformations.jsx';
import TwacodeTester from './pages/TwacodeTester.jsx';
import MenuList from 'components/menus/menu-component.jsx';
import './AppsParameters.scss';

export default class AppsParameters extends Component {
  constructor(props) {
    super(props);
    var user = Collections.get('users').find(userService.getCurrentUserId());
    this.state = {
      login: LoginService,
      i18n: Languages,
      users_repository: Collections.get('users'),
      currentUserService: currentUserService,
      page: props.initial_page || 1,
      attributeOpen: 0,
      subMenuOpened: 0,
      username: user ? user.username : '',
      last_name: user ? user.last_name : '',
      first_name: user ? user.first_name : '',
      thumbnail: false,
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
    // eslint-disable-next-line default-case
    switch (this.state.page) {
      case 1:
        return <WorkspaceApps />;
      case 2:
        return <WorkspaceAppsInformations />;
      case 3:
        return <TwacodeTester />;
    }
  }

  setPage(page) {
    this.setState({ page: page });
  }
  render() {
    return (
      <div className="appsParameters fade_in">
        <div className="main">
          <div className="sideBar">
            <MenuList
              menu={[
                {
                  type: 'menu',
                  text: Languages.t(
                    'scenes.app.popup.workspaceparameter.pages.your_apps_label',
                    [],
                    'Vos applications',
                  ),
                  emoji: ':control_knobs:',
                  selected: this.state.page === 1,
                  onClick: () => this.setPage(1),
                },
                {
                  type: 'menu',
                  text: 'Basic informations',
                  emoji: ':information_source:',
                  selected: this.state.page === 2,
                  onClick: () => this.setPage(2),
                },
                {
                  type: 'menu',
                  text: 'Twacode tester',
                  emoji: ':love_letter:',
                  selected: this.state.page === 3,
                  onClick: () => this.setPage(3),
                },
                {
                  type: 'menu',
                  text: Languages.t('general.back', [], 'Retour'),
                  icon: 'arrow-left',
                  onClick: () => popupManager.close(),
                },
              ]}
            />
          </div>

          <div className="content">{this.displayScene()}</div>
        </div>
      </div>
    );
  }
}
