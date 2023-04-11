/* eslint-disable @typescript-eslint/no-explicit-any */
import ws from 'app/deprecated/websocket/websocket.js';
import Workspaces from 'app/deprecated/workspaces/workspaces.jsx';
import User from 'app/features/users/services/current-user-service';
import LoginService from 'app/features/auth/login-service';
import { RightsOrNone } from '../../workspace-members/services/workspace-members-access-rights-service';
import Logger from 'app/features/global/framework/logger-service';

type WebsocketWorkspace = {
  type: 'remove' | 'add' | 'update_group_privileges' | 'update_workspace_level';
  group_id: string;
  workspace_id: string;
  level: RightsOrNone;
  workspace: any; // TODO
  privileges: any; // TODO
};

class WorkspacesListener {
  private logger: Logger.Logger;

  constructor() {
    this.logger = Logger.getLogger('WorkspacesListener');
  }

  startListen() {
    this.logger.debug('Start listener');

    ws.subscribe(
      `workspaces_of_user/${User.getCurrentUserId()}`,
      (_uri: any, data: WebsocketWorkspace) => {
        this.logger.debug('Got a message', data);
        LoginService.updateUser();

        if (data.workspace) {
          if (data.type === 'remove') {
            Workspaces.removeFromUser(data.workspace);
            Workspaces.notify();
          } else if (data.type === 'add') {
            Workspaces.notify();
          }
        }
      },
      null,
    );
  }

  cancelListen() {
    this.logger.debug('Cancel listener');
    ws.unsubscribe(`workspaces_of_user/${User.getCurrentUserId()}`, null, null);
  }
}

export default new WorkspacesListener();
