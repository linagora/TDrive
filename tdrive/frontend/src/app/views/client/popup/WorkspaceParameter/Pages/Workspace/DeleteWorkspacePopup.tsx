import React, { useEffect, useRef, useState } from 'react';

import { isEqual } from 'lodash';
import classNames from 'classnames';
import { AlertTriangle } from 'react-feather';
import { Alert, Button, Checkbox, Input, Row, Typography } from 'antd';

import Logger from 'app/features/global/framework/logger-service';
import { WorkspaceType, WorkspaceUserType } from 'app/features/workspaces/types/workspace';
import Languages from 'app/features/global/services/languages-service';
import ObjectModal from 'app/components/object-modal/object-modal';
import WorkspaceAPIClient from 'app/features/workspaces/api/workspace-api-client';
import RouterService from 'app/features/router/services/router-service';
import ModalManager from 'app/components/modal/modal-manager';
import WorkspaceUserAPIClient from 'app/features/workspace-members/api/workspace-members-api-client';

import './styles.scss';

const { Text } = Typography;
const logger = Logger.getLogger('DeleteWorkspacePopup');

export default () => {
  const { companyId, workspaceId } = RouterService.getStateFromRoute();
  const [workspace, setWorkspace] = useState<WorkspaceType>();
  const [checked, setChecked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [workspaceUsers, setWorkspaceUsers] = useState<WorkspaceUserType[]>([]);
  const [workspaceName, setWorkspaceName] = useState<string | undefined>();

  const handleWorkspaceChangesRef = useRef(async () => {
    if (companyId && workspaceId) {
      logger.log(`Proccessing request for workspace ${workspaceId}`);

      try {
        const res = await WorkspaceAPIClient.get(companyId, workspaceId);

        res && setWorkspace(res);
      } catch (e) {
        logger.error(`Error while trying to fetch workspace ${workspaceId}`, e);
      }
    }
  });

  const handleWorkspaceUsersChangesRef = useRef(async () => {
    if (companyId && workspaceId) {
      logger.log(`Proccessing request for workspace users ${workspaceId}`);

      try {
        const res = await WorkspaceUserAPIClient.list(companyId, workspaceId);

        res && setWorkspaceUsers(res);
      } catch (e) {
        logger.error(`Error while trying to fetch workspace users in ${workspaceId}`, e);
      }
    }
  });

  useEffect(() => {
    handleWorkspaceChangesRef.current();
    handleWorkspaceUsersChangesRef.current();
    setLoading(false);
  }, []);

  return workspace ? (
    <ObjectModal
      titleLevel={3}
      closable
      title={Languages.t('scenes.app.popup.workspaceparameter.pages.delete_workspace_popup.title', [
        workspace.name,
      ])}
      contentStyle={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
      footer={
        <Button
          type="primary"
          loading={loading}
          className={classNames('delete-workspace-button', {
            disabled:
              !isEqual(workspaceName, workspace.name) || !checked || workspaceUsers.length > 1,
          })}
          onClick={async () => {
            setLoading(true);
            await WorkspaceAPIClient.delete(workspace.company_id, workspace.id);
            window.location.replace('/');
            setLoading(false);
            ModalManager.close();
          }}
          disabled={
            !isEqual(workspaceName, workspace.name) || !checked || workspaceUsers.length > 1
          }
        >
          {Languages.t('general.delete')}
        </Button>
      }
    >
      {workspaceUsers.length > 1 && (
        <Row className="x-margin">
          {!loading ? (
            <Alert
              className="alert-total-members"
              type="error"
              message=""
              description={
                <>
                  <AlertTriangle color="var(--error)" size={16} className="small-right-margin" />
                  <Text>
                    {Languages.t(
                      'scenes.app.popup.workspaceparameter.pages.delete_workspace_popup.alert_total_members',
                      [workspaceUsers.length - 1, workspace.name],
                    )}
                  </Text>
                </>
              }
            />
          ) : (
            <></>
          )}
        </Row>
      )}

      <Row className="x-margin workspace-name-confirmation-input">
        <Input
          placeholder={`${Languages.t('scenes.app.popup.workspaceparameter.pages.enter')}${
            workspace.name
          }`}
          onChange={e => setWorkspaceName(e.target.value)}
        />
      </Row>

      <Row className="x-margin">
        <Checkbox onChange={() => setChecked(!checked)}>
          {Languages.t('scenes.app.popup.workspaceparameter.pages.delete_workspace_popup.checkbox')}
        </Checkbox>
      </Row>
    </ObjectModal>
  ) : (
    <></>
  );
};
