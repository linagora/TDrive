/* eslint-disable react/prop-types */
import React from 'react';
import Languages from 'app/features/global/services/languages-service';
import Icon from 'app/components/icon/icon.jsx';
import Collections from 'app/deprecated/CollectionsV1/Collections/Collections.js';
import Workspaces from 'app/deprecated/workspaces/workspaces.jsx';
import DriveService from 'app/deprecated/Apps/Drive/Drive.js';
import UploadZone from 'components/uploads/upload-zone';
import WorkspaceUserRights from 'app/features/workspaces/services/workspace-user-rights-service';
import MediumPopupManager from 'app/components/modal/modal-manager';
import { ObjectModal, ObjectModalTitle } from 'components/object-modal/deprecated-object-modal.jsx';
import UIFile from './ui/file.jsx';
import 'moment-timezone';

import './drive.scss';

export default class VersionDetails extends React.Component {
  constructor() {
    super();
    this.state = {
      workspaces: Workspaces,
      i18n: Languages,
    };
    Languages.addListener(this);
    DriveService.addListener(this);
    Collections.get('drive').addListener(this);
  }
  componentWillUnmount() {
    Languages.removeListener(this);
    DriveService.removeListener(this);
    Collections.get('drive').removeListener(this);
  }
  render() {
    var countVersion = (this.props.file.versions || []).length;
    return (
      <ObjectModal
        onClose={() => MediumPopupManager.closeAll()}
        footer={
          <div className="footerVersionDetails">
            <div className="addVersion">
              <div
                className="addVersionButton"
                onClick={() => {
                  if (this.upload_zone) {
                    this.upload_zone.open();
                  }
                }}
              >
                <div className="icon">
                  <Icon type="plus" className="m-icon-small iconWithBackground" />
                </div>
                <div className="footerTitle">
                  {Languages.t('components.drive.new_versions', [], 'Ajouter une nouvelle version')}
                </div>
              </div>
            </div>
          </div>
        }
        title={
          <div className="title allow_selection">
            <ObjectModalTitle>
              {Languages.t('scenes.apps.drive.right_preview.versions', [], 'Versions')}
            </ObjectModalTitle>
          </div>
        }
      >
        <div className="versionDetails drive_view list">
          <UploadZone
            disabled={WorkspaceUserRights.isNotConnected()}
            disableClick
            ref={node => (this.upload_zone = node)}
            parent={this.props.file.parent_id}
            driveCollectionKey={{ id: this.props.file.parent_id }}
            uploadOptions={{
              workspace_id: this.state.workspaces.currentWorkspaceId,
              new_version: true,
              file_id: this.props.file.id,
            }}
            allowPaste={true}
          >
            {(this.props.file.versions || [])
              .sort((a, b) => {
                return b.added - a.added;
              })
              .map((version, index) => {
                var data = {};
                if (index > 0) {
                  data.extension = this.props.file.extension;
                  data.name = version.name;
                  data.creator = version.creator;
                  data.size = version.size;
                } else {
                  data = JSON.parse(JSON.stringify(this.props.file));
                }
                data.added = version.added;
                return (
                  <div className="file" key={'version-' + version.id}>
                    <UIFile
                      isVersion
                      versionLabel={
                        index == 0 ? 'Version actuelle' : 'Version ' + (countVersion - index)
                      }
                      data={data}
                      menu={[
                        {
                          type: 'menu',
                          text: Languages.t(
                            'scenes.apps.drive.preview_bloc.operations_download',
                            [],
                            'Télécharger',
                          ),
                          onClick: () => {
                            var link = DriveService.getLink(this.props.file, version.id, 1);
                            window.open(link);
                          },
                        },
                      ]}
                      details={true}
                    />
                  </div>
                );
              })}
          </UploadZone>
        </div>
      </ObjectModal>
    );
  }
}
