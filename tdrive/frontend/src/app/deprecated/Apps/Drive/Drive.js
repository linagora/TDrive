import Observable from 'app/deprecated/CollectionsV1/observable.js';
import Api from 'app/features/global/framework/api-service';
import Workspaces from 'app/deprecated/workspaces/workspaces.jsx';
import Collections from 'app/deprecated/CollectionsV1/Collections/Collections.js';
import LocalStorage from 'app/features/global/framework/local-storage-service';
import AceModeList from './utils/ace_modelist.js';
import { getCompanyApplications } from 'app/features/applications/state/company-applications';
import Groups from 'app/deprecated/workspaces/groups.js';
import _ from 'lodash';

import Globals from 'app/features/global/services/globals-tdrive-app-service';

class Drive extends Observable {
  constructor() {
    super();
    this.setObservableName('app_drive_service');
    this.view_mode = 'grid';
    if (typeof window != 'undefined' && window.screen && window.screen.width < 550) {
      this.view_mode = 'list';
    }

    this.current_directory_channels = {};
    this.current_collection_key_channels = {};
    this.current_position_key_channels = {};
    this.is_in_trash_channels = {};

    this.root_directories = {};
    this.trash_directories = {};
    this.looking_for_root_directories = {};
    this.looking_for = {};
    this.changing_directory = {};

    this.public_access_token = null;

    if (!Globals.window.drive_service) {
      Globals.window.drive_service = [];
    }
    Globals.window.drive_service.push(this);
    this.view_mode = LocalStorage.getItem('drive_view') || 'grid';
  }

  addSourceIfNotExist(workspace_id, channel, parent_id, prefix) {
    if (!this.current_collection_key_channels[channel]) {
      this.current_collection_key_channels[channel] = 'drive' + channel;
    }
    Collections.get('drive').addSource(
      {
        http_base_url: 'drive/v2',
        http_options: {
          workspace_id: workspace_id || Workspaces.currentWorkspaceId,
          directory_id: parent_id || (this.current_directory_channels[channel] || {}).id,
          trash: parent_id ? false : !!this.is_in_trash_channels[channel],
          public_access_token: this.public_access_token,
        },
        websockets: [
          {
            uri:
              'drive/' +
              (workspace_id || Workspaces.currentWorkspaceId) +
              '/' +
              (parent_id || (this.current_directory_channels[channel] || {}).id) +
              (!parent_id && this.is_in_trash_channels[channel] ? '/trash' : ''),
            options: { type: 'drive' },
          },
        ],
      },
      (prefix ? prefix : '') + this.current_collection_key_channels[channel],
    );
    return (prefix ? prefix : '') + this.current_collection_key_channels[channel];
  }

  changeCurrentDirectory(channel, directory, workspace_id) {
    if (this.changing_directory[channel]) {
      return;
    }

    this.current_directory_channels[channel] = directory;

    if (!Collections.get('drive').find(directory.id)) {
      var wid = Workspaces.currentWorkspaceId;
      this.changing_directory[channel] = true;
      var tmp = this.find(
        workspace_id || Workspaces.currentWorkspaceId,
        directory.id || 'root',
        () => {
          this.changing_directory[channel] = false;
          this.changeCurrentDirectory(channel, directory, wid);
        },
      );
      if (!tmp._searching) {
        this.changing_directory[channel] = false;
      }
      this.current_directory_channels[channel] = tmp;
    } else {
      this.current_directory_channels[channel] = Collections.get('drive').find(directory.id);
    }

    var current_position_key =
      (this.current_directory_channels[channel] || {}).id +
      '_' +
      (workspace_id || Workspaces.currentWorkspaceId) +
      (this.is_in_trash_channels[channel] ? '_trash' : '') +
      channel;

    if (this.current_position_key_channels[channel] !== current_position_key) {
      this.current_position_key_channels[channel] = current_position_key;

      var old_drive_collection_key = this.current_collection_key_channels[channel];
      if (old_drive_collection_key) {
        Collections.get('drive').removeSource(old_drive_collection_key);
      }
      this.current_collection_key_channels[channel] = 'drive_' + current_position_key;

      this.addSourceIfNotExist(workspace_id, channel);
    }

    this.notify();
  }

  toggleInTrash(channel) {
    this.is_in_trash_channels[channel] = !this.is_in_trash_channels[channel];
    var dir = {};
    if (this.is_in_trash_channels[channel]) {
      dir = this.trash_directories[channel] || { id: 'trash' };
    } else {
      dir = this.root_directories[channel] || 'root';
    }

    this.changeCurrentDirectory(channel, dir);
  }

  toggleView() {
    this.view_mode = this.view_mode === 'grid' ? 'list' : 'grid';
    LocalStorage.setItem('drive_view', this.view_mode);
    this.notify();
  }

  find(workspace_id, directory_id, callback, test_preview_count, force) {
    if (!directory_id) {
      return;
    }

    if (directory_id === 'root' || directory_id === 'trash') {
      var key = workspace_id + '_' + directory_id;

      if (this.root_directories[key] && directory_id === 'root') {
        return this.root_directories[key] || {};
      }

      if (this.trash_directories[key] && directory_id === 'trash') {
        return this.trash_directories[key] || {};
      }

      if (this.looking_for_root_directories[key]) {
        return {};
      }

      this.looking_for_root_directories[key] = true;

      Api.post(
        '/ajax/drive/v2/find',
        {
          options: {
            element_id: directory_id,
            workspace_id: workspace_id,
            public_access_token: this.public_access_token,
          },
        },
        res => {
          this.looking_for_root_directories[key] = false;
          if (res && res.data) {
            if (directory_id === 'root') {
              this.root_directories[key] = res.data;
            }
            if (directory_id === 'trash') {
              this.trash_directories[key] = res.data;
            }
            Collections.get('drive').updateObject(res.data);
            if (callback) callback(res.data);
          }
        },
      );
      return { _searching: true };
    } else {
      if (this.looking_for[directory_id]) {
        return {};
      }

      if (Collections.get('drive').find(directory_id) && !force) {
        return Collections.get('drive').find(directory_id);
      }
      this.looking_for[directory_id] = true;

      Api.post(
        '/ajax/drive/v2/find',
        {
          options: {
            element_id: directory_id,
            workspace_id: workspace_id,
            public_access_token: this.public_access_token,
          },
        },
        res => {
          if (res && res.data) {
            this.looking_for[directory_id] = false;
            Collections.get('drive').updateObject(res.data);
            if (callback) {
              callback(res.data);
            }
            if (
              !res.data.is_directory &&
              !res.data.preview_has_been_generated &&
              (!test_preview_count || test_preview_count < 4)
            ) {
              setTimeout(() => {
                this.find(workspace_id, directory_id, () => {}, (test_preview_count || 0) + 1);
              }, 2000);
            }
          }
        },
      );
      return { _searching: true };
    }
  }

  addPathForElement(element, try_find) {
    element = Collections.get('drive').find(element.id) || element;

    if (!element.path) {
      if (try_find !== false) {
        this.find(
          element.workspace_id,
          element.id,
          res => {
            this.addPathForElement(res, false);
          },
          false,
          true,
        );
      }
      element.path = [];
    }

    if (
      element.path &&
      element.path[element.path.length - 1] &&
      element.path[element.path.length - 1].id !== element.id
    ) {
      element.path.push(JSON.parse(JSON.stringify(element)));
    }

    if (!element.parent_id || element.parent_id === 'root') {
      element.path = element.path || [];
      return;
    }

    var parent = Collections.get('drive').find(element.parent_id);

    if (!parent) {
      element.path = element.path || [];
      return;
    }

    element.path = JSON.parse(JSON.stringify(parent.path || [parent]));
    if (
      parent.path &&
      parent.path[parent.path.length - 1] &&
      parent.path[parent.path.length - 1].id !== element.id
    ) {
      element.path.push(JSON.parse(JSON.stringify(element)));
    }
  }

  save(object, driveCollectionKey) {
    Collections.get('drive').save(object, driveCollectionKey);
  }

  updateAccess(object, values, driveCollectionKey) {
    object.acces_info = object.acces_info || {};
    Object.keys(values).forEach(k => {
      object.acces_info[k] = values[k];
    });

    object._once_set_access = true;
    this.save(object, driveCollectionKey);
  }

  createFile(workspace_id, name, parent, options, driveCollectionKey, callback) {
    if (!name) {
      return;
    }

    if (!options) {
      options = {};
    }

    var file = Collections.get('drive').editCopy();

    file.name = name;
    file.trash = false;
    file.is_directory = false;
    file.parent_id = (parent || {}).id || 'root';
    file.workspace_id = workspace_id || Workspaces.currentWorkspaceId;
    if (options.url) {
      file.url = options.url;
    }
    if (options.download_content_from_url) {
      file.file_url = options.download_content_from_url;
    }

    this.addPathForElement(file);

    Collections.get('drive').save(file, driveCollectionKey, callback);
  }

  createDirectory(workspace_id, name, parent, driveCollectionKey, callback, options) {
    if (!name) {
      return;
    }

    if (!options) {
      options = {};
    }

    var directory = Collections.get('drive').editCopy();

    directory.name = name;
    directory.trash = false;
    directory.is_directory = true;
    directory.parent_id = (parent || {}).id || 'root';
    directory.workspace_id = workspace_id || Workspaces.currentWorkspaceId;
    directory.external_storage = options.external_storage || false;

    if (options.application_id) {
      directory.application_id = options.application_id;
    }

    this.addPathForElement(directory);

    Collections.get('drive').save(directory, driveCollectionKey, callback);
  }

  moveFile(objects_id, directory, driveCollectionKey) {
    if (objects_id && typeof objects_id != 'object') {
      objects_id = [objects_id];
    }
    if (!objects_id) {
      return;
    }

    if (!directory || !directory.is_directory || !directory.id) {
      return;
    }

    objects_id.forEach(el_id => {
      var el = Collections.get('drive').find(el_id);
      if (el && el.parent_id !== directory.id && el.id !== directory.id) {
        el.parent_id = directory.id;
        el.detached = false;
        this.addPathForElement(el);
        Collections.get('drive').save(el, driveCollectionKey);
      }
    });
  }

  removeDefinitively(element, collection_key) {
    if (element && typeof element != 'object') {
      element = [element];
    }
    if (!element) {
      return;
    }

    element.forEach(el => {
      Collections.get('drive').remove(el, collection_key);
    });
  }

  remove(element, collection_key) {
    if (element && typeof element != 'object') {
      element = [element];
    }
    if (!element) {
      return;
    }

    element.forEach(el => {
      el.trash = true;
      Collections.get('drive').save(el, collection_key);
    });
  }

  restore(element, collection_key) {
    if (element && typeof element != 'object') {
      element = [element];
    }
    if (!element) {
      return;
    }

    element.forEach(el => {
      el.trash = false;
      Collections.get('drive').save(el, collection_key);
    });
  }

  emptyTrash(workspace_id, callback) {
    Api.post('/ajax/drive/trash/empty', { workspace_id: workspace_id }, res => {
      if (!res.errors || res.errors.length === 0) {
        if (res.data) {
          this.trash_directories[workspace_id + '_trash'] = res.data;

          Collections.get('drive').updateObject(res.data);

          if (callback) callback();
        }
      }
    });
  }

  getLink(element, version_id, download, public_access_key) {
    if (element && element.length) {
      //Multiple elements

      var workspace_id = element[0].workspace_id;

      return (
        Api.route('/ajax/drive/download') +
          '?workspace_id=' +
          workspace_id +
          '&elements_id=' +
          element.map(item => item.id).join(',') +
          '&download=1' +
          '&parent_id=' +
          (element[0] || {}).parent_id ||
        element.parent_id + (public_access_key ? '&public_access_key=' + public_access_key : '')
      );
    }

    if (element.url) {
      return element.url;
    }

    // eslint-disable-next-line no-redeclare
    var workspace_id = element.workspace_id;
    var version = '';
    if (version_id !== undefined) {
      version = '&version_id=' + version_id;
    }
    return (
      Api.route('/ajax/drive/download') +
        '?workspace_id=' +
        workspace_id +
        '&element_id=' +
        element.id +
        version +
        '&download=' +
        (download ? '1' : '0') +
        '&parent_id=' +
        (element[0] || {}).parent_id ||
      element.parent_id + (public_access_key ? '&public_access_key=' + public_access_key : '')
    );
  }

  getFileType(file) {
    var extension = file.extension?.toLocaleLowerCase();

    var extension2type = {
      image: ['png', 'jpg', 'jpeg', 'gif', 'tiff', 'heic'],
      audio: ['wav', 'aif', 'aiff', 'mp3', 'flac'],
      link: ['url'],
      document: ['doc', 'docx', 'odt', 'rtf', 'txt'],
      slides: ['ppt', 'pptx', 'odp'],
      spreadsheet: ['xls', 'xlsx', 'ods', 'csv'],
      pdf: ['pdf'],
      svg: ['svg'],
      video: ['mp4', 'mov', 'avi', 'webm', 'm4v', 'mkv'],
      archive: ['zip', 'tar', 'gz', 'rar'],
      code: ['php', 'c', 'cpp', 'py', 'html', 'yml', 'json', 'md'],
    };

    var keys = Object.keys(extension2type);
    for (var i = 0; i < keys.length; i++) {
      if (extension2type[keys[i]].indexOf(extension) >= 0) {
        return keys[i];
      }
    }

    if (AceModeList.getMode(extension) !== 'text') {
      return 'code';
    }

    return 'other';
  }

  viewDocument(file, previewonly = false) {
    this.viewed_document = file;
    this.previewonly = previewonly;
    this.notify();
  }

  getEditorsCandidates(current) {
    var preview_candidate = [];
    var editor_candidate = [];

    if ((current.hidden_data || {}).preview_url) {
      preview_candidate.push({
        url: (current.hidden_data || {}).preview_url,
      });
    }
    if ((current.hidden_data || {}).editor_url) {
      editor_candidate.push({
        is_url_file: true,
        url: (current.hidden_data || {}).editor_url,
        name: (current.hidden_data || {}).editor_name || 'web link',
        app: {
          name: (current.hidden_data || {}).editor_name || 'web link',
        },
      });
    }

    const apps = getCompanyApplications(Groups.currentGroupId).filter(
      app =>
        app.display?.tdrive?.files?.editor?.preview_url ||
        app.display?.tdrive?.files?.editor?.edition_url,
    );

    //Primary exts
    apps.forEach(app => {
      if (
        (app.display?.tdrive?.files?.editor?.extensions || []).indexOf(
          ((current.extension || '') + (current.url ? '.url' : '')).toLocaleLowerCase(),
        ) >= 0
      ) {
        if (app.display?.tdrive?.files?.editor?.edition_url) {
          editor_candidate.push({ app });
        }
        if (app.display?.tdrive?.files?.editor?.preview_url) {
          preview_candidate.push({
            url: app.display?.tdrive?.files?.editor?.preview_url,
            app: app,
          });
        }
      }
    });

    //Default viewers

    if (this.getFileType(current) === 'pdf') {
      preview_candidate.push({
        url:
          '/public/viewer/PDFViewer/viewer.html?link=' +
          encodeURIComponent(this.getLink(current, null, true)),
      });
    }
    if (this.getFileType(current) === 'image') {
      preview_candidate.push({
        url:
          '/public/viewer/ImageViewer/viewer.html?link=' +
          encodeURIComponent(this.getLink(current, null, true)),
      });
    }
    if (this.getFileType(current) === 'video') {
      preview_candidate.push({
        url:
          '/public/viewer/VideoViewer/viewer.html?link=' +
          encodeURIComponent(this.getLink(current, null, true)),
      });
    }
    if (this.getFileType(current) === 'audio') {
      preview_candidate.push({
        url:
          '/public/viewer/AudioViewer/viewer.html?link=' +
          encodeURIComponent(this.getLink(current, null, true)),
      });
    }
    if (this.getFileType(current) === 'code') {
      preview_candidate.push({
        url:
          '/public/viewer/CodeViewer/viewer.html?ext=' +
          current.extension +
          '&link=' +
          encodeURIComponent(this.getLink(current, null, true)),
      });
    }

    //Secondary ext
    apps.forEach(app => {
      if (
        (app.display?.tdrive?.files?.editor?.extensions || []).indexOf(
          ((current.extension || '') + (current.url ? '.url' : '')).toLocaleLowerCase(),
        ) >= 0
      ) {
        if (app.display?.tdrive?.files?.editor?.edition_url) {
          editor_candidate.push({ app });
        }
        if (app.display?.tdrive?.files?.editor?.preview_url) {
          preview_candidate.push({
            url: app.display?.tdrive?.files?.editor?.preview_url,
            app: app,
          });
        }
      }
    });

    return {
      preview_candidate: _.uniqBy(preview_candidate, a => a.app?.id || a.url),
      editor_candidate: _.uniqBy(editor_candidate, a => a.app?.id || a.url),
    };
  }

  getFileUrlForEdition(url, app, id, cb) {
    if (!app) {
      cb(url);
      return;
    }
    Api.post(
      '/ajax/market/app/api/getToken',
      {
        application_id: app.id,
        workspace_id: Workspaces.currentWorkspaceId,
        group_id: Workspaces.currentGroupId,
      },
      res => {
        var token = res.token;
        url += (url.indexOf('?') > 0 ? '&' : '?') + 'token=' + token;
        url += '&file_id=' + id;
        url += '&workspace_id=' + Workspaces.currentWorkspaceId;
        url += '&group_id=' + Workspaces.currentGroupId;
        cb(url);
      },
    );
  }
}

const service = new Drive();
export default service;
