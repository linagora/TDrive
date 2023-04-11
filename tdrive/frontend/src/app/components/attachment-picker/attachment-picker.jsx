/* eslint-disable react/prop-types */
import React, { Component } from 'react';

import File from 'components/drive/file';
import FilePicker from 'components/drive/file-picker/file-picker.jsx';
import TaskPicker from 'components/task-picker/task-picker.jsx';
import Menu from 'components/menus/menu.jsx';
import Icon from 'app/components/icon/icon.jsx';
import Button from 'components/buttons/button.jsx';
import UploadZone from 'components/uploads/upload-zone';
import MenusManager from 'app/components/menus/menus-manager.jsx';
import Workspaces from 'app/deprecated/workspaces/workspaces.jsx';
import Languages from 'app/features/global/services/languages-service';
import './attachment-picker.scss';

export default class AttachmentPicker extends Component {
  /*
        props : {
            readOnly : bool
            attachments : []
            onChange
            className
        }
    */

  getIcon(att) {
    if (att.type.toLocaleLowerCase() === 'event') {
      return 'calendar-alt';
    }
    if (att.type.toLocaleLowerCase() === 'file') {
      return 'folder';
    }
    if (att.type.toLocaleLowerCase() === 'task') {
      return 'check-square';
    }
  }
  addAttachment(attachment) {
    var attachments = this.props.attachments || [];
    attachments.push(attachment);
    if (this.props.onChange) {
      this.props.onChange(attachments);
    }
  }
  removeAttachment(attachment) {
    var attachments = this.props.attachments || [];
    var index = attachments.indexOf(attachment);
    if (index >= 0) {
      attachments.splice(index, 1);
      if (this.props.onChange) {
        this.props.onChange(attachments);
      }
    }
  }
  render() {
    return (
      <div className={'attachmentPicker ' + (this.props.className || '')}>
        <div className="attachments">
          {(Object.values(this.props.attachments || {}) || []).map(att => {
            if (att.type === 'file') {
              var additionalMenu = [];
              if (!this.props.readOnly) {
                additionalMenu = [
                  {
                    type: 'menu',
                    text: Languages.t(
                      'components.attachmentpicker.remove_attach',
                      [],
                      'Remove attachment',
                    ),
                    onClick: () => {
                      this.removeAttachment(att);
                    },
                  },
                ];
              }
              return (
                <div className="attachment attachment_file drive_view list" key={`attachment_file-${att.id}`}>
                  <File
                    data={{ id: att.id || '' }}
                    additionalMenu={additionalMenu}
                    notInDrive={true}
                    style={{ marginBottom: 0 }}
                  />
                </div>
              );
            }
            return (
              <div className="attachment" key={att.id}>
                <Icon className="app-icon" type={this.getIcon(att)} />
                {att.name}
                {!this.props.readOnly && (
                  <Icon
                    className="remove"
                    type="times"
                    onClick={() => {
                      this.removeAttachment(att);
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
        {!this.props.readOnly && (
          <Menu
            style={{ display: 'inline-block' }}
            menu={[
              {
                type: 'menu',
                text: Languages.t('components.attachmentpicker.file', [], 'File'),
                icon: 'file',
                submenu: [
                  {
                    type: 'menu',
                    icon: 'desktop',
                    text: Languages.t(
                      'components.attachmentpicker.from_computer',
                      [],
                      'From computer',
                    ),
                    onClick: () => {
                      this.upload_zone.open();
                      MenusManager.closeMenu();
                    },
                  },
                  {
                    type: 'menu',
                    icon: 'folder',
                    text: Languages.t(
                      'components.attachmentpicker.from_tdrive',
                      [],
                      'From Tdrive Documents',
                    ),
                    submenu: [
                      {
                        type: 'react-element',
                        reactElement: (
                          <FilePicker
                            mode={'select_file'}
                            onChoose={res => {
                              this.addAttachment({ type: 'file', id: res.id, name: res.name });
                              MenusManager.closeMenu();
                            }}
                            initialDirectory={{ id: '' }}
                          />
                        ),
                      },
                    ],
                  },
                ],
              },
              {
                type: 'menu',
                text: Languages.t('scenes.apps.tasks.task', [], 'Task'),
                icon: 'check-square',
                submenu: [
                  {
                    type: 'react-element',
                    reactElement: (
                      <TaskPicker
                        mode={'select_task'}
                        onChoose={res => {
                          this.addAttachment({ type: 'task', id: res.id, name: res.title });
                          MenusManager.closeMenu();
                        }}
                      />
                    ),
                  },
                ],
              },
            ]}
          >
            {' '}
            <Button className="small secondary-text right-margin">
              <Icon type="plus" className="m-icon-small" />{' '}
              {Languages.t(
                'components.attachmentpicker.add_attachment',
                [],
                'Ajouter des pièces jointes',
              )}
            </Button>
          </Menu>
        )}

        <UploadZone
          ref={node => (this.upload_zone = node)}
          disableClick
          parent={''}
          driveCollectionKey={'attachment_' + Workspaces.currentWorkspaceId}
          uploadOptions={{ workspace_id: Workspaces.currentWorkspaceId, detached: true }}
          onUploaded={res => {
            this.addAttachment({ type: 'file', id: res.id, name: res.name });
          }}
          multiple={false}
        />
      </div>
    );
  }
}
