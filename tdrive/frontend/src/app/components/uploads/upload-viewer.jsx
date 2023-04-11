import React from 'react';

import UploadManager from './upload-manager.js';
import CloseIcon from '@material-ui/icons/CloseOutlined';
import './uploads.scss';
import moment from 'moment';
import Languages from 'app/features/global/services/languages-service';

export default class UploadViewer extends React.Component {
  constructor(props) {
    super();
    this.state = {
      upload_manager: UploadManager,
    };
    UploadManager.addListener(this);
  }
  componentWillUnmount() {
    UploadManager.removeListener(this);
  }
  render() {
    if (this.state.upload_manager.currentUploadTotalNumber <= 0) {
      // eslint-disable-next-line react/no-direct-mutation-state
      this.state.large = true;
      return '';
    }

    var documents = this.state.upload_manager.currentUploadFiles.filter(d => !d.path.substr(1));
    var folders = {};
    var folders_content = {};
    this.state.upload_manager.currentUploadFiles
      .filter(d => d.path.substr(1))
      .forEach(d => {
        var folder = d.path.substr(1).split('/')[0];
        if (!folders[folder]) {
          folders[folder] = {
            total: 0,
            total_progress: 0,
            total_uploaded: 0,
            error: true,
            cancelled: true,
          };
          folders_content[folder] = [];
        }

        if (!d.cancelled) {
          folders[folder].cancelled = false;
        }

        if (!d.error) {
          folders[folder].error = false;
        }

        if (!d.error && !d.cancelled) {
          folders[folder].total++;
          folders[folder].total_progress += d.progress;
          if (d.progress === 1) {
            folders[folder].total_uploaded += 1;
          }

          folders_content[folder].push(d);
        }
      });
    Object.keys(folders).forEach(name => {
      documents.push({
        progress: folders[name].total_progress / folders[name].total,
        name: name,
        cancelled: folders[name].cancelled,
        error: folders[name].error,
        folder_total: folders[name].total,
        folder_total_uploaded: folders[name].total_uploaded,
        all_files: folders_content[name],
      });
    });

    var total_finished =
      this.state.upload_manager.currentUploadedFilesNumber +
      this.state.upload_manager.currentCancelledFilesNumber +
      this.state.upload_manager.currentErrorFilesNumber;
    var todo = this.state.upload_manager.currentUploadTotalNumber;

    var total_finished_size = this.state.upload_manager.currentUploadFiles
      .map(a => {
        if (a.error || a.cancelled) {
          return (a.file || {}).size || 0;
        }
        if (a.progress > 0) {
          return ((a.file || {}).size || 0) * a.progress;
        }
        return 0;
      })
      .reduce((a, b) => {
        return a + b;
      });
    var todo_size = this.state.upload_manager.currentUploadFiles
      .map(a => {
        return (a.file || {}).size || 0;
      })
      .reduce((a, b) => {
        return a + b;
      });

    var remaining_time = 0;
    if (total_finished_size > 0) {
      remaining_time =
        ((todo_size - total_finished_size) / 1000000) *
        ((new Date().getTime() - this.state.upload_manager.currentUploadStartTime) /
          (total_finished_size / 1000000));
    }

    return (
      <div
        className={
          'upload_viewer ' +
          (this.state.upload_manager.will_close ? 'fade_out ' : 'skew_in_left_nobounce ')
        }
      >
        <div className="title" onClick={() => this.setState({ large: !this.state.large })}>
          {Languages.t('general.uploading')} {total_finished}/{todo}
        </div>
        {remaining_time > 0 && (
          <div className="subtitle">
            Will end {moment(new Date().getTime() + remaining_time).fromNow()}
          </div>
        )}
        <div className="uploads" style={{ display: this.state.large ? 'block' : 'none' }}>
          {documents
            .sort((a, b) => (a.progress === 1) - (b.progress === 1))
            .map(item => {
              return (
                <div
                  key={item.unid}
                  className={
                    'uploadingFile ' +
                    (item.cancelled || item.error ? 'stopped ' : '') +
                    (item.progress === 1 && !item.error ? 'done ' : '') +
                    (item.progress < 1 && !item.error && !item.cancelled ? 'progress ' : '')
                  }
                >
                  <div
                    className="progress_bar"
                    style={{ width: parseInt(item.progress * 100) + '%' }}
                  />
                  <div className="name">
                    {item.name} {item.folder_total !== undefined && '(Folder)'}
                  </div>
                  {item.path && item.path.substr(1) && (
                    <div className="path">{item.path.substr(1)}</div>
                  )}
                  {item.folder_total !== undefined && (
                    <div className="path">
                      {item.folder_total_uploaded}/{item.folder_total}
                    </div>
                  )}
                  <div className="progress">{parseInt((item.progress || 0) * 100)}%</div>
                  <div
                    className="cancel"
                    onClick={() => {
                      UploadManager.abort(item.all_files || item);
                    }}
                  >
                    <CloseIcon className="m-icon-small" />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  }
}
