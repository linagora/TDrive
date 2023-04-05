/* eslint-disable react/prop-types */
import React, { Component } from 'react';

import DriveService from 'app/deprecated/Apps/Drive/Drive.js';
import Workspaces from 'app/deprecated/workspaces/workspaces.jsx';
import Languages from 'app/features/global/services/languages-service';
import Collections from 'app/deprecated/CollectionsV1/Collections/Collections.js';
import UIFile from '../ui/file.jsx';
import UIDirectory from '../ui/directory.jsx';
import LeftIcon from '@material-ui/icons/KeyboardArrowLeftOutlined';
import NewFolderIcon from '@material-ui/icons/CreateNewFolderOutlined';
import Menu from 'components/menus/menu.jsx';
import Button from 'components/buttons/button.jsx';
import Input from 'components/inputs/input.jsx';
import './file-picker.scss';

export default class FilePicker extends Component {
  constructor() {
    super();
    this.drive_channel = 'file_picker_' + Workspaces.currentWorkspaceId;
    this.drive_collection_key = this.drive_channel;

    this.state = {
      i18n: Languages,
      drive_repository: Collections.get('drive'),
      app_drive_service: DriveService,
      current_selection: {},
      creating_folder: false,
    };

    Languages.addListener(this);
    Collections.get('drive').addListener(this);
    DriveService.addListener(this);
  }
  componentWillUnmount() {
    Languages.removeListener(this);
    Collections.get('drive').removeListener(this);
    DriveService.removeListener(this);

    if (this.drive_channel) {
      Collections.get('drive').removeSource(
        this.state.app_drive_service.current_collection_key_channels[this.drive_channel],
      );
    }
  }
  componentDidMount() {
    this.changeCurrentDirectory({ id: (this.props.initialDirectory || {}).id || '' });
  }
  clickOnFile(file) {
    if (this.props.mode == 'select_file') {
      this.setState({ current_selection: file });
    }
  }
  changeCurrentDirectory(directory) {
    if (this.props.mode == 'select_file') {
      this.setState({ current_selection: {} });
    }
    if (this.props.mode == 'select_location') {
      this.setState({ current_selection: directory });
    }
    DriveService.changeCurrentDirectory(this.drive_channel, directory);
  }
  submit() {
    var result = null;
    if (this.props.mode == 'select_file') {
      result = this.state.current_selection;
    }
    if (this.props.mode == 'select_location') {
      result = this.state.app_drive_service.current_directory_channels[this.drive_channel] || {};
    }
    Menu.closeAll();
    if (this.props.onChoose) this.props.onChoose(result);
  }
  render() {
    var workspace_id = Workspaces.currentWorkspaceId;
    var directory =
      this.state.app_drive_service.current_directory_channels[this.drive_channel] || {};
    var directory_id = directory.id;

    var filter_dir = {
      workspace_id: workspace_id,
      parent_id: directory_id,
      is_directory: true,
      trash: false,
    };
    var directories = this.state.drive_repository
      .findBy(filter_dir)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    var filter_files = {
      workspace_id: workspace_id,
      parent_id: directory_id,
      is_directory: false,
      trash: false,
    };
    var files = this.state.drive_repository
      .findBy(filter_files)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    var allow_go_parent = true;
    var drive_channel = null;
    if (!drive_channel && (this.props.initialDirectory || {}).id == directory_id) {
      allow_go_parent = false;
    }

    return (
      <div className="filepicker">
        <div className="title">
          {directory.parent_id && allow_go_parent && (
            <LeftIcon
              className="m-icon-small getback"
              onClick={() => {
                this.changeCurrentDirectory({ id: directory.parent_id });
              }}
            />
          )}{' '}
          {directory.parent_id
            ? directory.name
            : Languages.t('app.identity?.name.tdrive_drive', [], 'Documents')}
        </div>
        <div className="drive_view list">
          {directories.map((item, index) => (
            <div
              key={'file_picker_dirs_' + index}
              className="directory"
              onClick={() => DriveService.changeCurrentDirectory(this.drive_channel, item)}
            >
              <UIDirectory data={item} />
            </div>
          ))}
          {files.map((item, index) => (
            <div
              key={'file_picker_files_' + index}
              className={
                'file ' +
                (this.props.mode == 'select_location' ? 'disabled ' : '') +
                (this.state.current_selection.id == item.id ? 'is_selected ' : '')
              }
              onClick={() => this.clickOnFile(item)}
            >
              <UIFile data={item} />
            </div>
          ))}
        </div>

        {this.state.creating_folder && (
          <div className="menu-buttons" style={{ display: 'flex' }}>
            <Button
              className="button small secondary"
              style={{ float: 'left' }}
              onClick={() => this.setState({ creating_folder: false })}
            >
              <LeftIcon className="m-icon-small" />
            </Button>
            <Input
              style={{ margin: 0, marginLeft: 5, flex: 1 }}
              className="small"
              refInput={node => (node ? node.focus() : '')}
              type="text"
              defaultValue={''}
              placeholder={Languages.t(
                'scenes.apps.drive.navigators.navigator_content.directory_name',
                [],
                'Nom du dossier',
              )}
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  DriveService.createDirectory(
                    directory.workspace_id,
                    e.target.value,
                    directory,
                    DriveService.current_collection_key_channels[this.drive_channel],
                    res => {
                      this.changeCurrentDirectory(res);
                    },
                  );
                  this.setState({ creating_folder: false });
                }
              }}
            />
          </div>
        )}
        {!this.state.creating_folder && (
          <div className="menu-buttons">
            {!this.state.creating_folder && directory.workspace_id && (
              <Button
                className="button small secondary"
                style={{ float: 'left' }}
                onClick={() => this.setState({ creating_folder: true })}
              >
                <NewFolderIcon className="m-icon-small" />
              </Button>
            )}
            {this.props.mode == 'select_location' && (
              <Button
                className="small"
                value={Languages.t('components.drive.moove_here', [], 'Déplacer ici')}
                onClick={() => this.submit()}
              />
            )}
            {this.props.mode == 'select_file' && this.state.current_selection.id && (
              <Button
                className="small"
                value={Languages.t('scenes.app.taskpicker.select', [], 'Sélectionner')}
                onClick={() => this.submit()}
              />
            )}
          </div>
        )}
      </div>
    );
  }
}
