import React, { Component } from 'react';

import Languages from 'app/features/global/services/languages-service';
import InputWithClipBoard from 'components/input-with-clip-board/input-with-clip-board.jsx';
import workspaceService from 'app/deprecated/workspaces/workspaces.jsx';
import userService from 'app/features/users/services/current-user-service';
import './pages.scss';

export default class WorkspaceAppsInformations extends Component {
  render() {
    return (
      <div className="apps">
        <div className="title">
          {Languages.t(
            'scenes.app.popup.appsparameters.pages.title_informations',
            'Basic informations',
          )}
        </div>
        <div className="group_section">
          <div className="subtitle">
            {Languages.t(
              'scenes.app.popup.appsparameters.pages.subtitle_informations',
              'Informations related to applications management',
            )}
          </div>

          <div className="smalltext">
            {Languages.t(
              'scenes.app.popup.appsparameters.pages.smalltext_user_id',
              'Current user id',
            )}
          </div>
          <InputWithClipBoard disabled={true} value={userService.getCurrentUserId()} />

          <div className="smalltext">
            {Languages.t(
              'scenes.app.popup.appsparameters.pages.smalltext_workspace_id',
              'Current workspace id',
            )}
          </div>
          <InputWithClipBoard disabled={true} value={workspaceService.currentWorkspaceId} />

          <div className="smalltext">
            {Languages.t(
              'scenes.app.popup.appsparameters.pages.smalltext_group_id',
              'Current group id',
            )}
          </div>
          <InputWithClipBoard disabled={true} value={workspaceService.currentGroupId} />
        </div>
      </div>
    );
  }
}
