/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import Draggable from 'components/draggable/draggable';
import DriveElement from './drive-element.jsx';
import './drive.scss';
import UIFile from './ui/file.jsx';
import Loader from 'components/loader/loader.jsx';
import WorkspaceUserRights from 'app/features/workspaces/services/workspace-user-rights-service';
import Languages from 'app/features/global/services/languages-service';

type StateType = any;

type NodeType = any;

export default class File extends DriveElement {
  node: NodeType;
  state: StateType;
  constructor() {
    super();
    this.state = {
      loading: true,
    };
  }
  componentDidMount() {
    super.componentDidMount();
    if (this.state.loading) {
      setTimeout(() => {
        this.setState({ loading: false });
      }, 4000);
    }
  }
  render() {
    if (!this.state.element || !this.state.element.front_id) {
      return (
        <div
          className={'file mini ' + (this.props.notInDrive ? 'notInDrive ' : '')}
          style={{ textAlign: 'center' }}
        >
          {this.state.loading && <Loader color="#CCC" className="file_loader" />}
          {!this.state.loading && (
            <span className="text" style={{ opacity: 0.5 }}>
              {Languages.t('scenes.apps.drive.preview_bloc.error_file', [], 'File not found.')}
            </span>
          )}
        </div>
      );
    } else {
      this.state.loading = false;
    }

    if (this.props.hide) {
      return '';
    }

    const mini = (!this.state.element.has_preview && this.props.notInDrive) || this.props.mini;
    return (
      <Draggable
        style={this.props.style}
        className={
          'js-drive-multi-selector-selectable file ' +
          (this.state.selected ? 'is_selected ' : '') +
          (this.props.notInDrive ? 'notInDrive ' : '') +
          (mini ? 'mini ' : '') +
          this.props.className
        }
        refDraggable={(node: NodeType) => (this.node = node)}
        onClick={(evt: any) => this.clickElement(evt, this.props.previewonly)}
        onDoubleClick={this.props.onDoubleClick}
        parentClassOnDrag="drive_view list"
        onDragStart={(evt: any) => {
          this.dragElement(evt);
        }}
        minMove={10}
        data={{ type: 'file', selection_type: this.props.selectionType, data: this.props.data }}
        deactivated={WorkspaceUserRights.isNotConnected() || this.props.notInDrive}
      >
        <UIFile
          data={this.state.element}
          menu={!this.props.removeIcon && this.common_menu}
          details={true}
          removeIcon={this.props.removeIcon}
          removeOnClick={(e: any) => {
            e.preventDefault();
            e.stopPropagation();
            this.props.removeOnClick();
          }}
        />
      </Draggable>
    );
  }
}
