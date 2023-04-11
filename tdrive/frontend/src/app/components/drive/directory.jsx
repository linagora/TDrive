import React from 'react';
import DriveElement from './drive-element.jsx';
import UIDirectory from './ui/directory.jsx';
import Loader from 'components/loader/loader.jsx';

import WorkspaceUserRights from 'app/features/workspaces/services/workspace-user-rights-service';
import Draggable from 'components/draggable/draggable';
import DroppableZone from 'components/draggable/droppable-zone.jsx';
import Languages from 'app/features/global/services/languages-service';
import './drive.scss';

export default class Directory extends DriveElement {
  constructor(props) {
    super();
    this.props = props;
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
        <div className="directory mini" style={{ textAlign: 'center' }}>
          {this.state.loading && <Loader color="#CCC" className="file_loader" />}
          {!this.state.loading && (
            <span className="text" style={{ opacity: 0.5 }}>
              {Languages.t(
                'components.drive.navigators.directory_not_found',
                [],
                'Directory not found.',
              )}
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

    return (
      <DroppableZone
        types={['file']}
        onDrop={data => this.dropFile(data)}
        onLongOver={this.props.onClick}
        className="directory_drop_zone"
      >
        <Draggable
          style={this.props.style}
          className={
            'js-drive-multi-selector-selectable fade_in directory ' +
            (this.state.selected ? 'is_selected ' : '') +
            this.props.className
          }
          deactivated={
            (this.state.element.is_directory && this.state.element.application_id) ||
            WorkspaceUserRights.isNotConnected()
          }
          refDraggable={node => (this.node = node)}
          onClick={evt => {
            this.clickElement(evt);
          }}
          onDoubleClick={this.props.onDoubleClick}
          parentClassOnDrag="grid"
          onDragStart={evt => {
            this.dragElement(evt);
          }}
          minMove={10}
          data={{ type: 'file', selection_type: this.props.selectionType, data: this.props.data }}
        >
          <UIDirectory data={this.state.element} menu={this.common_menu} details={true} />
        </Draggable>
      </DroppableZone>
    );
  }
}
