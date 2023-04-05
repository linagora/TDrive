import Observable from 'app/deprecated/CollectionsV1/observable.js';

import Globals from 'app/features/global/services/globals-tdrive-app-service';

class UploadManager extends Observable {
  constructor() {
    super();
    this.observableName = 'uploadService';

    this.globalStatus = 0;
    this.uploads = [];
    this.sessionUploaded = 0;
    this.uploaded_entities = [];
    this.uploading = 0;

    Globals.window.uploads = this;
  }

  updateData() {
    var totalSize = 0;
    var totalUp = 0;
    for (var i = 0; i < this.uploads.length; i++) {
      totalSize += this.uploads[i].size;
      totalUp += this.uploads[i].uploaded;
      this.uploads[i].status = (100 * this.uploads[i].uploaded) / (this.uploads[i].size + 1);
    }

    if (this.sessionUploaded + this.uploads.length === 0) {
      this.globalStatus = 0;
    } else if (totalSize === 0) {
      this.globalStatus =
        (100 * this.sessionUploaded) / (this.sessionUploaded + this.uploads.length);
    } else {
      this.globalStatus =
        (100 * (totalUp / totalSize + this.sessionUploaded)) /
        (this.sessionUploaded + this.uploads.length);
    }

    if (this.uploads.length === 0) {
      this.globalStatus = 0;
      this.sessionUploaded = 0;

      if (this.callback) {
        var uploaded = [];
        // eslint-disable-next-line no-redeclare
        for (var i = 0; i < this.uploaded_entities.length; i++) {
          uploaded.push(this.uploaded_entities[i]);
        }

        this.callback(uploaded);
        this.uploaded_entities = [];
      }
    }

    this.notify();
  }

  getFilesTree(event, fcb) {
    function newDirectoryApi(input, cb) {
      var fd = [],
        files = [];
      var iterate = function (entries, path, resolve) {
        var promises = [];
        entries.forEach(function (entry) {
          promises.push(
            new Promise(function (resolve) {
              if ('getFilesAndDirectories' in entry) {
                entry.getFilesAndDirectories().then(function (entries) {
                  iterate(entries, entry.path + '/', resolve);
                });
              } else {
                if (entry.name) {
                  var p = (path + entry.name).replace(/^[/\\]/, '');
                  fd.push(entry);
                  files.push(p);
                }
                resolve();
              }
            }),
          );
        });
        Promise.all(promises).then(resolve);
      };
      input.getFilesAndDirectories().then(function (entries) {
        new Promise(function (resolve) {
          iterate(entries, '/', resolve);
        }).then(cb.bind(null, fd, files));
      });
    }

    // old prefixed API implemented in Chrome 11+ as well as array fallback
    function arrayApi(input, cb) {
      var fd = [],
        files = [];
      [].slice.call(input.files).forEach(function (file) {
        fd.push(file);
        files.push(file.webkitRelativePath || file.name);
      });
      cb(fd, files);
    }

    // old drag and drop API implemented in Chrome 11+
    function entriesApi(items, cb) {
      var fd = [],
        files = [],
        rootPromises = [];

      function readEntries(entry, reader, oldEntries, cb) {
        var dirReader = reader || entry.createReader();
        dirReader.readEntries(function (entries) {
          var newEntries = oldEntries ? oldEntries.concat(entries) : entries;
          if (entries.length) {
            setTimeout(readEntries.bind(null, entry, dirReader, newEntries, cb), 0);
          } else {
            cb(newEntries);
          }
        });
      }

      function readDirectory(entry, path, resolve) {
        if (!path) path = entry.name;
        readEntries(entry, 0, 0, function (entries) {
          var promises = [];
          entries.forEach(function (entry) {
            promises.push(
              new Promise(function (resolve) {
                if (entry.isFile) {
                  entry.file(function (file) {
                    var p = path + '/' + file.name;
                    fd.push(file);
                    files.push(p);
                    resolve();
                  }, resolve.bind());
                } else readDirectory(entry, path + '/' + entry.name, resolve);
              }),
            );
          });
          Promise.all(promises).then(resolve.bind());
        });
      }

      [].slice.call(items).forEach(function (entry) {
        entry = entry.webkitGetAsEntry();
        if (entry) {
          rootPromises.push(
            new Promise(function (resolve) {
              if (entry.isFile) {
                entry.file(function (file) {
                  fd.push(file);
                  files.push(file.name);
                  resolve();
                }, resolve.bind());
              } else if (entry.isDirectory) {
                readDirectory(entry, null, resolve);
              }
            }),
          );
        }
      });
      Promise.all(rootPromises).then(cb.bind(null, fd, files));
    }

    var cb = function (event, files, paths) {
      var tree = {};
      paths.forEach(function (path, file_index) {
        var dirs = tree;
        var real_file = files[file_index];
        path.split('/').forEach(function (dir, dir_index) {
          if (dir.indexOf('.') === 0) {
            return;
          }
          if (dir_index === path.split('/').length - 1) {
            dirs[dir] = real_file;
          } else {
            if (!dirs[dir]) {
              dirs[dir] = {};
            }
            dirs = dirs[dir];
          }
        });
      });

      fcb(tree);
    };

    if (event.dataTransfer) {
      var dt = event.dataTransfer;
      if (dt.items && dt.items.length && 'webkitGetAsEntry' in dt.items[0]) {
        entriesApi(dt.items, cb.bind(null, event));
      } else if ('getFilesAndDirectories' in dt) {
        newDirectoryApi(dt, cb.bind(null, event));
      } else if (dt.files) {
        arrayApi(dt, cb.bind(null, event));
      } else cb();
    } else if (event.target) {
      var t = event.target;
      if (t.files && t.files.length) {
        arrayApi(t, cb.bind(null, event));
      } else if ('getFilesAndDirectories' in t) {
        newDirectoryApi(t, cb.bind(null, event));
      } else {
        cb(event);
      }
    } else {
      fcb(event);
    }
  }
}

const upload = new UploadManager();
export default upload;
