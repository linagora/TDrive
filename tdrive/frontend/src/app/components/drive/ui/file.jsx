/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-key */
import React from 'react';
import moment from 'moment';
import 'moment-timezone';

import Icon from 'app/components/icon/icon';
import Menu from 'components/menus/menu';
import DriveService from 'app/deprecated/Apps/Drive/Drive';
import Numbers from 'app/features/global/utils/Numbers';
import FileType from './file-type';
import TagPicker from 'components/tag-picker/tag-picker';
import { addApiUrlIfNeeded } from 'app/features/global/utils/URLUtils';
import '../drive.scss';
import { formatTime } from '@features/global/utils/Numbers';

export default class File extends React.Component {
  constructor() {
    super();
  }
  render() {
    var date = false;
    if (this.props.data.modified) {
      date = new Date(this.props.data.modified * 1000);
    }
    if (this.props.data.added && this.props.isVersion) {
      date = new Date(this.props.data.added * 1000);
    }

    var date_string = date ? formatTime(date) : '-';

    return [
      <div
        key="preview"
        className={
          'preview file_type_icon ' +
          DriveService.getFileType(this.props.data) +
          ' ' +
          (this.props.data.has_preview ? '' : 'no_preview')
        }
        style={
          this.props.data.has_preview
            ? { backgroundImage: addApiUrlIfNeeded(this.props.data.preview_link, true) }
            : {}
        }
      >
        <div className="tags_list">
          <TagPicker inline readOnly noPlaceholder value={this.props.data.tags || []} />
        </div>
      </div>,
      <div key="data" className="data">
        <div className={'file_type_icon'}>
          <FileType type={DriveService.getFileType(this.props.data)} scale={0.75} fill={'#000'} />
        </div>
        <div className="text">
          {!!this.props.versionLabel && <div className="inline-tag">{this.props.versionLabel}</div>}
          {this.props.data.name}
          {!this.props.isVersion && (this.props.data.versions || {}).length > 1 && (
            <span style={{ opacity: 0.5, marginLeft: 4 }}>
              ({(this.props.data.versions || {}).length} versions)
            </span>
          )}
          &nbsp;&nbsp;
          <TagPicker
            className="no-grid"
            inline
            readOnly
            noPlaceholder
            value={this.props.data.tags || []}
          />
        </div>

        {(this.props.data.acces_info || {}).token && (
          <Icon type="link-h" className="m-icon-small" />
        )}
        {this.props.data.url && <Icon type="external-link-alt" className="m-icon-small" />}

        {/*
            <div className="created-by no-grid">
              {this.state.element.created_by || "-"}
            </div>
            */}
        {this.props.details && [
          <div className="last-modified no-grid">{date_string}</div>,
          <div className="size no-grid">
            {this.props.data.size ? Numbers.humanFileSize(this.props.data.size, true) : '-'}
          </div>,
        ]}
        {!this.props.isVersion && (
          <div className="detail_preview_parent no-grid">
            <div
              className={
                'detail_preview file_type_icon ' +
                DriveService.getFileType(this.props.data) +
                ' ' +
                (this.props.data.has_preview ? '' : 'no_preview')
              }
              style={
                this.props.data.has_preview
                  ? { backgroundImage: addApiUrlIfNeeded(this.props.data.preview_link, true) }
                  : {}
              }
            />
          </div>
        )}
        {this.props.menu && this.props.menu.length > 0 && (
          <Menu menu={this.props.menu} className="options">
            <Icon type="ellipsis-h" className="m-icon-small" />
          </Menu>
        )}

        {this.props.removeIcon === true && (
          <Icon type="times" className="m-icon-small" onClick={this.props.removeOnClick} />
        )}
      </div>,
    ];
  }
}
