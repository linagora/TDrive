import Observable from 'app/deprecated/CollectionsV1/observable.js';
import Number from 'app/features/global/utils/Numbers';
import DriveService from 'app/deprecated/Apps/Drive/Drive.js';
import Collections from 'app/deprecated/CollectionsV1/Collections/Collections.js';
import Resumable from 'app/features/files/utils/resumable.js';
import Globals from 'app/features/global/services/globals-tdrive-app-service';
import Api from 'app/features/global/framework/api-service';
import JWTStorage from 'app/features/auth/jwt-storage-service';

class UploadManager extends Observable {
  constructor() {
    super();
    this.setObservableName('upload_manager');
    this.reinit();

    window.uploadManager = this;
  }

  reinit() {
    if (this.reinitTimeout) clearTimeout(this.reinitTimeout);
    if (this.reinitTimeoutBefore) clearTimeout(this.reinitTimeoutBefore);
    this.currentUploadTotalSize = 0;
    this.currentUploadTotalNumber = 0;
    this.currentUploadedTotalSize = 0;
    this.currentUploadedFilesNumber = 0;
    this.currentUploadingFilesNumber = 0;
    this.currentCancelledFilesNumber = 0;
    this.currentWaitingFilesNumber = 0;
    this.currentErrorFilesNumber = 0;
    this.currentUploadFiles = [];
    this.currentUploadStartTime = new Date();
    this.will_close = false;
    this.notify();
  }

  reinitAfterDelay() {
    if (this.reinitTimeout) clearTimeout(this.reinitTimeout);
    if (this.reinitTimeoutBefore) clearTimeout(this.reinitTimeoutBefore);
    this.reinitTimeoutBefore = setTimeout(() => {
      this.will_close = true;
      this.notify();
      this.reinitTimeout = setTimeout(() => {
        this.reinit();
      }, 500);
    }, 800);
  }

  startUpload(
    elements,
    total_number,
    total_size,
    drive_parent,
    upload_options,
    driveCollectionKey,
    callback,
  ) {
    if (this.addElementsRecursive(elements, '')) {
      this.uploadRecursive(elements, drive_parent, upload_options, driveCollectionKey, callback);
    } else {
      this.currentUploadFiles = [];
      this.currentUploadTotalNumber = 0;
      this.currentUploadTotalSize = 0;
      this.currentWaitingFilesNumber = 0;
      this.currentUploadStartTime = new Date();
      this.reinit();
    }
  }

  addElementsRecursive(elements, path) {
    return Object.keys(elements).every(name => {
      var element = elements[name];
      if (element.size) {
        //File
        this.currentUploadTotalSize += element.size;
        this.currentUploadTotalNumber++;
        this.currentUploadFiles.push({
          unid: Number.unid(),
          progress: 0,
          cancelled: false,
          error: false,
          name: name,
          path: path,
          xhr: null,
          file: element,
        });
      } else {
        //Directory
        if (!this.addElementsRecursive(element, path + '/' + name)) {
          return false;
        }
      }
      return true;
    });
  }

  uploadRecursive(elements, drive_parent, upload_options, driveCollectionKey, callback) {
    Object.keys(elements).forEach(name => {
      var element = elements[name];
      if (element.size) {
        //File
        this.uploadFile(element, drive_parent, upload_options, driveCollectionKey, callback);
      } else {
        //Directory
        this.createDirectory(name, drive_parent, upload_options, driveCollectionKey, directory => {
          if (callback) callback(directory);
          if (directory) {
            this.uploadRecursive(element, directory, upload_options, driveCollectionKey);
          }
        });
      }
    });
  }

  createDirectory(name, parent, upload_options, driveCollectionKey, callback) {
    if (this.currentUploadingFilesNumber > 4) {
      setTimeout(() => {
        this.createDirectory(name, parent, upload_options, driveCollectionKey, callback);
      }, 500);
      return;
    }

    this.currentUploadingFilesNumber++;

    DriveService.createDirectory(
      upload_options.workspace_id,
      name,
      parent,
      driveCollectionKey,
      dir => {
        this.currentUploadingFilesNumber--;
        if (callback) callback(dir);
      },
    );
  }

  abort(elements) {
    var that = this;

    if (elements.length === undefined) {
      elements = [elements];
    }

    elements.forEach(element => {
      if (element.resumable) element.resumable.cancel();
      element.xhr_cancelled = true;
      element.cancelled = true;
      that.currentCancelledFilesNumber++;
      that.currentUploadingFilesNumber--;

      if (
        that.currentUploadedFilesNumber +
          that.currentCancelledFilesNumber +
          that.currentErrorFilesNumber >=
        that.currentUploadTotalNumber
      ) {
        that.reinitAfterDelay();
      }
    });

    that.notify();
  }

  uploadFile(element, drive_parent, upload_options, driveCollectionKey, callback, timeout_count) {
    this.currentWaitingFilesNumber++;

    if (!timeout_count) {
      timeout_count = 0;
    }

    if (this.currentUploadingFilesNumber > 4) {
      setTimeout(() => {
        this.currentWaitingFilesNumber--;
        this.uploadFile(
          element,
          drive_parent,
          upload_options,
          driveCollectionKey,
          callback,
          timeout_count + 1,
        );
      }, Math.max(30000, 500 * (this.currentWaitingFilesNumber + 1) + Math.random() * 1000));
      return;
    }

    this.currentWaitingFilesNumber--;
    this.currentUploadingFilesNumber++;

    // eslint-disable-next-line no-unused-vars
    var listIndex = 0;
    var current_item = 0;
    this.currentUploadFiles.forEach((item, i) => {
      if (item.file === element) {
        listIndex = i;
        current_item = item;
      }
    });

    var that = this;

    if (current_item.xhr_cancelled === true) {
      return;
    }

    var extension = element.name.split('.');
    var r_data = {
      workspace_id: upload_options.workspace_id,
      name: element.name,
      extension: extension[extension.length - 1],
    };

    //Use Resumable.js for upload by chunk
    var r = new Resumable({
      target: `${Globals.api_root_url}/ajax/driveupload/upload`,
      chunkSize: 50000000,
      testChunks: false,
      simultaneousUploads: 5,
      withCredentials: true,
      maxChunkRetries: 2,
      headers: {
        Authorization: JWTStorage.getAutorizationHeader(),
      },
      query: {
        object: JSON.stringify({
          id: upload_options.new_version ? upload_options.file_id : null,
          _once_new_version: upload_options.new_version,
          front_id: Number.unid(),
          is_directory: false,
          name: element.name,
          parent_id: drive_parent ? drive_parent.id : null,
          workspace_id: upload_options.workspace_id,
          detached: upload_options.detached,
        }),
      },
      generateUniqueIdentifier: (file, event) => {
        return 'no_id';
      },
    });

    current_item.resumable = r;

    current_item.timeout = setTimeout(() => {
      this.currentUploadingFilesNumber--;
    }, 60000);

    r.on('fileSuccess', function (file, message) {
      clearTimeout(current_item.timeout);

      that.currentUploadedFilesNumber++;
      that.currentUploadingFilesNumber--;
      current_item.progress = 1;

      if (
        that.currentUploadedFilesNumber +
          that.currentCancelledFilesNumber +
          that.currentErrorFilesNumber >=
        that.currentUploadTotalNumber
      ) {
        that.reinitAfterDelay();
      }

      var resp = JSON.parse(message);

      if (resp.data && resp.data.object) {
        Collections.get('drive').updateObject(resp.data.object);
        Collections.get('drive').share(resp.data.object);

        if (callback) callback(Collections.get('drive').find(resp.data.object.id));

        var parent = Collections.get('drive').find(resp.data.object.parent_id);
        if (parent) {
          parent.size = parseInt(parent.size) + parseInt(resp.data.object.size || 0);
          Collections.get('drive').updateObject(parent);
        }
      } else {
        current_item.error = 1;
      }

      that.notify();
    });
    r.on('progress', function (file, message) {
      current_item.progress = Math.min(r.progress(), 0.99);
      that.notify();

      clearTimeout(current_item.timeout);
      current_item.timeout = setTimeout(() => {
        this.currentUploadingFilesNumber--;
      }, 60000);
    });
    r.on('fileError', function (file, message) {
      clearTimeout(current_item.timeout);

      that.currentErrorFilesNumber++;
      that.currentUploadingFilesNumber--;
      current_item.error = true;

      if (
        that.currentUploadedFilesNumber +
          that.currentCancelledFilesNumber +
          that.currentErrorFilesNumber >=
        that.currentUploadTotalNumber
      ) {
        that.reinitAfterDelay();
      }

      that.notify();
    });

    r.addFile(element);

    Api.post(
      '/ajax/driveupload/preprocess',
      {
        workspace_id: r_data.workspace_id,
        name: r_data.name,
        identifier: r_data.identifier,
        extension: r_data.extension,
      },
      res => {
        var identifier = res.identifier;
        var file = r.getFromUniqueIdentifier('no_id');
        file.uniqueIdentifier = identifier;
        r.upload();
      },
    );
  }
}

const service = new UploadManager();
export default service;
