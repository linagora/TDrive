/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Observable from '@deprecated/CollectionsV1/observable.js';
import workspaceService from '@deprecated/workspaces/workspaces.jsx';
import Api from '@features/global/framework/api-service';
import AlertManager from '@features/global/services/alert-manager-service';
import Globals from '@features/global/services/globals-tdrive-app-service';
import Languages from '@features/global/services/languages-service';
import User from '@features/users/services/current-user-service';
import WorkspaceUserRights from '@features/workspaces/services/workspace-user-rights-service';

const prefixRoute = '/internal/services/workspaces/v1';

class WorkspacesUsers extends Observable {
  public users_by_workspace: { [key: string]: any };
  public users_by_group: { [key: string]: any };
  public membersPending: any[];

  public updateRoleUserLoading: { [key: string]: boolean };
  public updateLevelUserLoading: { [key: string]: boolean };

  public offset_by_workspace_id: any;
  public offset_by_group_id: any;

  public loading: boolean;

  public errorOnInvitation: boolean;
  public errorUsersInvitation: any[];

  constructor() {
    super();
    this.setObservableName('workspacesUsers');

    this.users_by_workspace = {};
    this.users_by_group = {};

    this.membersPending = [];

    this.updateRoleUserLoading = {};
    this.updateLevelUserLoading = {};

    this.offset_by_workspace_id = {};
    this.offset_by_group_id = {};
    this.errorOnInvitation = false;
    this.errorUsersInvitation = [];

    this.loading = false;
    (Globals.window as any).workspaceUserService = this;
  }
  getAdminLevel(idWorkspace = workspaceService.currentWorkspaceId) {
    return false;
  }
  getDefaultLevel(idWorkspace = workspaceService.currentWorkspaceId) {
    return false;
  }
  isGroupManager() {}
  getLevel(idLevel: string) {
    return false;
  }

  getUsersByWorkspace(workspace_id: string) {
    return (this.users_by_workspace || {})[workspace_id] || {};
  }

  canShowUserInWorkspaceList(member: any) {
    // if user is interne or wexterne => no restriction
    if (!WorkspaceUserRights.isInvite()) {
      return true;
    } else {
      if (!WorkspaceUserRights.isInvite(member)) {
        // if other user is interne or wexterne
        return true;
      }
    }
    return false;
  }

  searchUserInWorkspace(query: any, cb: (args: any) => void) {
    User.search(
      query,
      {
        scope: 'workspace',
        workspace_id: workspaceService.currentWorkspaceId,
        group_id: workspaceService.currentGroupId,
      },
      results => {
        cb(results);
      },
    );
  }

  leaveWorkspace() {
    AlertManager.confirm(() => {
      try {
        const deleteWorkspaceUser = `${prefixRoute}/companies/${
          workspaceService.currentGroupId
        }/workspaces/${workspaceService.currentWorkspaceId}/users/${User.getCurrentUserId()}`;
        Api.delete(deleteWorkspaceUser, (res: any) => {
          if (res.status === 'success') {
            window.location.reload();
          } else {
            AlertManager.alert(() => {}, {
              text: Languages.t(
                'scenes.app.popup.workspaceparameter.pages.alert_impossible_removing',
              ),
            });
          }
        });
      } catch (err) {
        console.log(err);
      }
    });
  }

  fullStringToEmails(str: string) {
    const regex =
      // eslint-disable-next-line no-useless-escape
      /(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/gm;
    const mailToArray: any[] = [];
    const stringToArray = str.match(regex);

    (stringToArray || []).map(item => mailToArray.push(item.toLocaleLowerCase()));

    return mailToArray.filter((elem, index, self) => index === self.indexOf(elem));
  }
}

const service = new WorkspacesUsers();
export default service;
