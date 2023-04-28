import DepreciatedCollections from '@deprecated/CollectionsV1/Collections/Collections.js';
import Observable from '@deprecated/CollectionsV1/observable.js';
import { default as popupManager, default as PopupManager } from '@deprecated/popupManager/popupManager.js';
import JWTStorage from '@features/auth/jwt-storage-service';
import loginService from '@features/auth/login-service';
import ConsoleService from '@features/console/services/console-service';
import Api from '@features/global/framework/api-service';
import LocalStorage from '@features/global/framework/local-storage-service';
import Logger from '@features/global/framework/logger-service';
import Globals from '@features/global/services/globals-tdrive-app-service';
import WindowService from '@features/global/utils/window';
import RouterServices from '@features/router/services/router-service';
import workspacesUsers from '@features/workspace-members/services/workspace-members-service';
import $ from 'jquery';
import WorkspaceAPIClient from '../../features/workspaces/api/workspace-api-client';

class Workspaces extends Observable {
  constructor() {
    super();
    Globals.window.workspaceService = this;

    this.setObservableName('workspaces');
    this.logger = Logger.getLogger('services/Workspaces');

    this.currentWorkspaceId = '';
    this.currentWorkspaceIdByGroup = {};
    this.currentGroupId = null;

    this.user_workspaces = {};
    this.getting_details = {};
    this.showNoWorkspacesPage = false;
    this.showNoCompaniesPage = false;
    this.loading = false;

    this.url_values = WindowService.getInfoFromUrl() || {};

    this.didFirstSelection = false;
  }

  updateCurrentWorkspaceId(workspaceId, notify = false) {
 
  }

  updateCurrentCompanyId(companyId, notify = false) {
    if (this.currentGroupId !== companyId && companyId) {
      this.currentGroupId = companyId;
      notify && this.notify();
    }
  }

  openNoWorkspacesPage() {
    this.showNoWorkspacesPage = true;
    this.notify();
  }

  closeNoWorkspacesPage() {
    this.showNoWorkspacesPage = false;
    popupManager.close();
    this.notify();
  }

  openNoCompaniesPage() {
    this.showNoCompaniesPage = true;
    this.notify();
  }

  closeNoCompaniesPage() {
    this.showNoCompaniesPage = false;
    popupManager.close();
    this.notify();
  }

  openCreateCompanyPage(page) {
    popupManager.open(page, this.user_workspaces.length > 0);
  }

  closeCreateCompanyPage() {
    popupManager.close();
  }

  closeCreateWorkspacePage() {
    popupManager.close();
  }

  changeGroup(group) {
    this.updateCurrentCompanyId(group.id);
    this.notify();
    if (this.currentWorkspaceIdByGroup[group.id]) {
      this.select(this.user_workspaces[this.currentWorkspaceIdByGroup[group.id]]);
      return;
    }
    this.select(this.getOrderedWorkspacesInGroup(group.id)[0]);
  }

  select(workspace, replace = false) {
    if (!workspace) {
      return;
    }
    if (workspace.id === this.currentWorkspaceId) {
      return;
    }

    this.updateCurrentWorkspaceId(workspace.id);

    const route = RouterServices.generateRouteFromState({
      companyId: workspace.company_id,
      workspaceId: workspace.id,
      channelId: '',
    });
    if (replace) {
      RouterServices.replace(route);
    } else {
      RouterServices.push(route);
    }

    LocalStorage.setItem(`default_workspace_id_${workspace.company_id}`, workspace.id);

    this.notify();
  }

  removeFromUser(workspace) {
    if (!workspace) {
      return;
    }

    var id = workspace.id || workspace;
    delete this.user_workspaces[id];
  }

  getOrderedWorkspacesInGroup(group_id) {
    var object = [];
    Object.keys(this.user_workspaces)
      .sort((_a, _b) => {
        var a = this.user_workspaces[_a] || {};
        var b = this.user_workspaces[_b] || {};
        return (a.name || '').localeCompare(b.name || '');
      })
      .forEach(e => {
        // eslint-disable-next-line no-redeclare
        var e = this.user_workspaces[e];
        if (!group_id || e?.company_id === group_id) {
          object.push(e);
        }
      });
    return object;
  }

  async createWorkspace(wsName, wsMembers, groupId, groupName, groupCreationData) {
    var that = this;
    that.loading = true;
    that.notify();
    const res = await WorkspaceAPIClient.create(groupId, {
      name: wsName,
      logo: '',
      default: false,
    });
    var workspace = res;
    if (workspace) {
      //Update rights and more
      loginService.updateUser();
      if (wsMembers.length > 0) {
        //Invite using console
        ConsoleService.addMailsInWorkspace({
          workspace_id: workspace.id || '',
          company_id: workspace?.group?.id || workspace.company_id || '',
          emails: wsMembers,
        }).finally(() => {
          that.loading = false;
          popupManager.close();
          if (workspace) {
            that.select(workspace);
          } else {
            that.notify();
          }
        });
      } else {
        that.loading = false;
        popupManager.close();
        if (workspace) {
          that.select(workspace);
        } else {
          that.notify();
        }
      }
    }
  }

  async updateWorkspaceName(name) {
    this.loading = true;
    this.notify();

    try {
      const result = await WorkspaceAPIClient.update(this.currentGroupId, this.currentWorkspaceId, {
        name,
      });
      this.logger.debug('Workspace updated', result);

    } catch (err) {
      this.logger.error('Can not update the workspace', err);
    }
    this.loading = false;
    this.notify();
  }

  updateWorkspaceLogo(logo) {
    this.loading = true;
    this.notify();
    var route = `${Globals.api_root_url}/ajax/workspace/data/logo`;

    var data = new FormData();
    if (logo !== false) {
      data.append('logo', logo);
    }
    data.append('workspaceId', this.currentWorkspaceId);
    var that = this;

    $.ajax({
      url: route,
      type: 'POST',
      data: data,
      cache: false,
      contentType: false,
      processData: false,

      headers: {
        Authorization: JWTStorage.getAutorizationHeader(),
      },
      xhrFields: {
        withCredentials: true,
      },
      xhr: function () {
        var myXhr = $.ajaxSettings.xhr();
        myXhr.onreadystatechange = function () {
          if (myXhr.readyState === XMLHttpRequest.DONE) {
            that.loading = false;
            var resp = JSON.parse(myXhr.responseText);
            if (resp.errors.indexOf('badimage') > -1) {
              that.error_identity_badimage = true;
              that.notify();
            } else {
              that.notify();
            }
          }
        };
        return myXhr;
      },
    });
  }
  deleteWorkspace() {
    if (
      workspacesUsers.getUsersByWorkspace(this.currentWorkspaceId) &&
      (Object.keys(workspacesUsers.getUsersByWorkspace(this.currentWorkspaceId)) || []).length > 1
    ) {
      this.errorDeleteWorkspaceMember = true;
      this.notify();
    } else if (this.currentWorkspaceId) {
      Api.post('/ajax/workspace/delete', { workspaceId: this.currentWorkspaceId }, function (res) {
        PopupManager.close();
      });
    }
    window.location.reload();
  }
}

export default new Workspaces();
