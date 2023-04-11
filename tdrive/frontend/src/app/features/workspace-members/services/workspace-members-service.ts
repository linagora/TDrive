/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Languages from 'app/features/global/services/languages-service';
import Observable from 'app/deprecated/CollectionsV1/observable.js';
import User from 'app/features/users/services/current-user-service';
import Api from 'app/features/global/framework/api-service';
import ws from 'app/deprecated/websocket/websocket.js';
import Collections from 'app/deprecated/CollectionsV1/Collections/Collections.js';
import workspaceService from 'app/deprecated/workspaces/workspaces.jsx';
import Numbers from 'app/features/global/utils/Numbers';
import WorkspaceUserRights from 'app/features/workspaces/services/workspace-user-rights-service';
import CurrentUser from 'app/deprecated/user/CurrentUser';
import AlertManager from 'app/features/global/services/alert-manager-service';
import Globals from 'app/features/global/services/globals-tdrive-app-service';

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
    const levels = Collections.get('workspaces').find(idWorkspace).levels;
    if (levels) {
      for (let i = 0; i < levels.length; i++) {
        if (levels[i].admin) {
          return levels[i];
        }
      }
    }
    return false;
  }
  getDefaultLevel(idWorkspace = workspaceService.currentWorkspaceId) {
    const levels = Collections.get('workspaces').find(idWorkspace).levels;
    if (levels) {
      for (let i = 0; i < levels.length; i++) {
        if (levels[i].default) {
          return levels[i];
        }
      }
    }
    return false;
  }
  isGroupManager() {}
  getLevel(idLevel: string) {
    const levels = Collections.get('workspaces').find(workspaceService.currentWorkspaceId).levels;
    for (let i = 0; i < levels.length; i++) {
      if (idLevel === levels[i].id) {
        return levels[i];
      }
    }
    return false;
  }

  getUsersByWorkspace(workspace_id: string) {
    return (this.users_by_workspace || {})[workspace_id] || {};
  }

  unload(workspace_id: string) {
    ws.unsubscribe('workspace_users/' + workspace_id, null, null);
  }

  load(workspace_id: string, reset_offset: string, options: any) {
    if (!options) {
      options = {};
    }

    const that = this;
    const workspace = Collections.get('workspaces').find(workspace_id);
    if (!workspace) {
      return;
    }
    const group_id = workspace?.group?.id || workspace.company_id;

    if (!this.users_by_group[group_id]) {
      this.users_by_group[group_id] = {};
    }
    if (!this.users_by_workspace[workspace_id]) {
      this.users_by_workspace[workspace_id] = {};
    }

    if (!this.offset_by_workspace_id[workspace_id] || reset_offset) {
      this.offset_by_workspace_id[workspace_id] = [0, false];
    }
    if (!this.offset_by_group_id[group_id] || reset_offset) {
      this.offset_by_group_id[group_id] = [0, false];
    }

    const loadMembers = (data: any) => {
      if (!data) {
        return;
      }
      if (typeof data.members === 'object' && data.members.members) {
        data = data.members;
      }
      if (data.members) {
        (data.members || []).forEach((item: any) => {
          if (
            !that.offset_by_workspace_id[workspace_id][1] ||
            Numbers.compareTimeuuid(item.user.id, that.offset_by_workspace_id[workspace_id][1]) > 0
          ) {
            that.offset_by_workspace_id[workspace_id][1] = item.user.id;
          }
          that.offset_by_workspace_id[workspace_id][0]++;

          Collections.get('users').completeObject(item.user, item.user.front_id);

          that.users_by_group[group_id][item.user.id] = item;
          that.users_by_workspace[workspace_id][item.user.id] = item;
        });
        that.notify();
      }

      if (data.mails) {
        that.membersPending = data.mails || [];
        that.notify();
      }

      if (data.stats.total_members > 1 && WorkspaceUserRights.hasWorkspacePrivilege()) {
        CurrentUser.updateTutorialStatus('did_invite_collaborators');
      }
    };

    const data = {
      workspaceId: workspace_id,
      max: this.offset_by_workspace_id[workspace_id][0] === 0 ? 100 : 40,
    };

    if (options.members) {
      loadMembers(options.members || []);
    } else {
      Api.post('/ajax/workspace/members/list', data, (res: any) => {
        if (res.data) {
          loadMembers({ members: res.data });
        }
      });
      Api.post('/ajax/workspace/members/pending', data, (res: any) => {
        if (res.data) {
          loadMembers({ mails: res.data });
        }
      });
      loadMembers(options.members || []);
    }

    const loadGroupUsers = (data: any) => {
      data.users.forEach((item: any) => {
        if (
          !that.offset_by_group_id[group_id][1] ||
          Numbers.compareTimeuuid(item.user.id, that.offset_by_group_id[group_id][1]) > 0
        ) {
          that.offset_by_group_id[group_id][1] = item.user.id;
        }
        that.offset_by_group_id[group_id][0]++;

        Collections.get('users').completeObject(item.user, item.user.front_id);

        that.users_by_group[group_id][item.user.id] = item;
      });
      that.notify();
    };

    if (options.group_users) {
      loadMembers(options.group_users);
    }
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

      // check in all channel if 2 chavite are in the same channel
      const channelsInWorkspace = Collections.get('channels').findBy({
        direct: false,
        application: false,
        original_workspace: workspaceService.currentWorkspaceId,
      });
      for (let i = 0; i < channelsInWorkspace.length; i++) {
        // check in all channel if 2 chavite are in the same channel
        if (channelsInWorkspace[i].ext_members) {
          let bothAreInChannel = 0; // if 1 : one of 2 users searched is in channel as chavite, 2 : both are in channel as chavite
          const extMembers = channelsInWorkspace[i].ext_members;
          for (let j = 0; j < extMembers.length; j++) {
            if (extMembers[j] === member || extMembers[j] === CurrentUser.get().id) {
              bothAreInChannel++;
              if (bothAreInChannel >= 2) {
                return true;
              }
            }
          }
        }
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
