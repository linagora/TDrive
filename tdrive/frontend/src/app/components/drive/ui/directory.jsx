/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-key */
import React from 'react';

import Icon from 'app/components/icon/icon.jsx';
import FolderIcon from '@material-ui/icons/FolderOutlined';
import Menu from 'components/menus/menu.jsx';
import Numbers from 'app/features/global/utils/Numbers';
import '../drive.scss';
import 'moment-timezone';
import { getCompanyApplication as getApplication } from 'app/features/applications/state/company-applications';

export default class Directory extends React.Component {
  constructor() {
    super();
  }
  render() {
    var app = {};
    if (this.props.data.application_id && this.props.data.external_storage) {
      app = getApplication(this.props.data.application_id);
    }

    return [
      <div style={{ display: 'inherit', width: '100%' }}>
        <div className="icon">
          {!app.id && <FolderIcon className="m-icon-small" />}
          {!!app.id && (
            <div
              className="app_icon"
              style={{ backgroundImage: "url('" + app.identity?.icon + "')" }}
            />
          )}
        </div>
        <div className="text">
          {this.props.data.name}
          {!!app.id && <i> ({app.identity?.name})</i>}
        </div>

        {(this.props.data.acces_info || {}).token && (
          <Icon type="cloud-share" className="m-icon-small" />
        )}

        {this.props.details && (
          <div className="size no-grid">
            {this.props.data.size ? Numbers.humanFileSize(this.props.data.size, true) : '-'}
          </div>
        )}
        {this.props.menu && this.props.menu.length > 0 && (
          <Menu menu={this.props.menu} className="options">
            <Icon type="ellipsis-h" className="m-icon-small" />
          </Menu>
        )}
      </div>,
    ];
  }
}
