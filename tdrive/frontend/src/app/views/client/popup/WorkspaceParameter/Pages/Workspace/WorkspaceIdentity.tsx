import React, { Suspense, useEffect, useRef, useState } from 'react';

import { isEqual } from 'lodash';
import { Avatar, Button, Col, Descriptions, Divider, Input, Row, Switch, Typography } from 'antd';

import Languages from 'app/features/global/services/languages-service';
import { useCurrentWorkspace } from 'app/features/workspaces/hooks/use-workspaces';
import AvatarComponent from 'app/components/avatar/avatar';
import ModalManager from 'app/components/modal/modal-manager';
import DeleteWorkspacePopup from './DeleteWorkspacePopup';
import WorkspaceAPIClient, {
  WorkspaceUpdateResource,
} from 'app/features/workspaces/api/workspace-api-client';
import { ToasterService as Toaster } from 'app/features/global/services/toaster-service';
import { addApiUrlIfNeeded } from 'app/features/global/utils/URLUtils';
import { getBase64 } from 'app/features/global/utils/strings';

const { Item } = Descriptions;
const { Text, Title, Link } = Typography;

const MAX_LOGO_FILE_SIZE = 5000000;
const ALLOWED_LOGO_FORMATS = ['image/gif', 'image/jpeg', 'image/png'];

const WorkspaceIdentity = () => {
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const { workspace, refresh } = useCurrentWorkspace();
  const [workspaceName, setWorkspaceName] = useState<string | undefined>(workspace?.name);

  const onClickUpdateWorkspace = async (partials: WorkspaceUpdateResource) => {
    const updatedObject: WorkspaceUpdateResource = {
      ...(partials.name && { name: partials.name }),
      ...(partials.default && { default: partials.default }),
      ...(partials.logo && { logo: partials.logo || '' }),
      ...(partials.logo_b64 && { logo_b64: partials.logo_b64 }),
    };

    if (workspace) {
      try {
        const res = await WorkspaceAPIClient.update(
          workspace.company_id,
          workspace.id,
          updatedObject,
        );

        if (res) {
          res && refresh();
          res.name && setWorkspaceName(res.name);

          Toaster.success(
            Languages.t(
              'scenes.app.popup.workspaceparameter.pages.workspace_identity.toaster.success.update',
            ),
          );

          return res;
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const onChangeWorkspaceLogo = async () => {
    if (!uploadInputRef?.current) return;
    const file = uploadInputRef.current.files?.[0];
    try {
      if (file && workspace) {
        if (file.size > MAX_LOGO_FILE_SIZE) {
          throw new Error(
            Languages.t(
              'scenes.app.popup.workspaceparameter.pages.workspace_identity.toaster.error.max_size',
            ),
          );
        }
        if (!ALLOWED_LOGO_FORMATS.includes(file.type)) {
          throw new Error(
            Languages.t(
              'scenes.app.popup.workspaceparameter.pages.workspace_identity.toaster.error.bad_format',
            ),
          );
        }

        const res = await onClickUpdateWorkspace({ logo_b64: await getBase64(file) });
        if (!res) {
          throw new Error(
            Languages.t(
              'scenes.app.popup.workspaceparameter.pages.workspace_identity.toaster.error.unknown',
            ),
          );
        }
      }
    } catch (err) {
      Toaster.error(
        `${Languages.t(
          'scenes.app.popup.workspaceparameter.pages.workspace_identity.toaster.error.prefix',
        )} - ${Languages.t(err as string)}`,
      );
    }
    uploadInputRef.current.value = '';
  };

  useEffect(() => {
    uploadInputRef?.current && (uploadInputRef.current.onchange = onChangeWorkspaceLogo);
  }, [uploadInputRef, onChangeWorkspaceLogo]);

  return (
    <>
      <Title level={1}>{Languages.t('scenes.app.popup.workspaceparameter.pages.title')}</Title>
      <Suspense fallback={<></>}>
        <div>
          <Divider />

          <Descriptions layout="vertical" bordered>
            <Item
              label={Languages.t('scenes.app.popup.workspaceparameter.pages.name_label')}
              span={3}
            >
              <Row align="middle" justify="start" className="small-bottom-margin">
                <Text type="secondary">
                  {Languages.t('scenes.app.popup.workspaceparameter.pages.name_description')}
                </Text>
              </Row>
              <Row align="middle" justify="space-between">
                <Col flex="auto" className="small-right-margin">
                  <Input value={workspaceName} onChange={e => setWorkspaceName(e.target.value)} />
                </Col>

                <Col>
                  <Button
                    type="primary"
                    disabled={isEqual(workspaceName, workspace?.name)}
                    onClick={() => workspaceName && onClickUpdateWorkspace({ name: workspaceName })}
                  >
                    {Languages.t('general.save')}
                  </Button>
                </Col>
              </Row>
            </Item>

            <Item
              span={3}
              label={Languages.t('scenes.app.popup.workspaceparameter.pages.logo_subtitle')}
            >
              <Row align="middle" justify="start" className="small-bottom-margin">
                <Text type="secondary">
                  {Languages.t('scenes.app.popup.workspaceparameter.pages.logo_modify_description')}
                </Text>
              </Row>

              <Row align="middle" justify="space-between">
                <Col
                  className="workspace-logo-column"
                  onClick={() => {
                    uploadInputRef.current?.click();
                  }}
                >
                  {workspace?.logo && workspace?.logo.length > 0 ? (
                    <AvatarComponent size={64} url={addApiUrlIfNeeded(workspace.logo)} />
                  ) : (
                    <Avatar
                      size={64}
                      shape="square"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Title level={2} style={{ margin: 0 }} type="secondary">
                        {workspace?.name.split('')[0].toUpperCase()}
                      </Title>
                    </Avatar>
                  )}
                </Col>
                <Col
                  flex="auto"
                  className="small-left-margin"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Text type="secondary">
                    {Languages.t('scenes.app.popup.workspaceparameter.pages.weight_max_small_text')}
                  </Text>

                  {workspace?.logo && workspace?.logo.length > 0 && (
                    <Link
                      type="danger"
                      className="small-top-margin"
                      onClick={() => {
                        // If file is not uploaded but in the inputNode value
                        if (uploadInputRef.current?.value) {
                          uploadInputRef.current.value = '';
                        }

                        // Delete workspace logo
                        onClickUpdateWorkspace({ logo: uploadInputRef.current?.value || 'none' });
                      }}
                    >
                      {Languages.t('general.delete')}
                    </Link>
                  )}
                </Col>
              </Row>
            </Item>

            <Item
              span={3}
              label={Languages.t(
                'scenes.app.popup.workspaceparameter.pages.workspace_identity.default_workspace.label',
              )}
            >
              <Row wrap={false} align="middle" justify="space-between">
                <Col>
                  <Text type="secondary">
                    {Languages.t(
                      'scenes.app.popup.workspaceparameter.pages.workspace_identity.default_workspace.description',
                    )}
                  </Text>
                </Col>
                <Col>
                  <Switch
                    defaultChecked={workspace?.default}
                    onChange={e => onClickUpdateWorkspace({ default: e })}
                  />
                </Col>
              </Row>
            </Item>
            <Item
              span={3}
              label={Languages.t('scenes.app.popup.workspaceparameter.pages.deleteworkspace')}
            >
              <Row wrap={false} align="middle" justify="space-between">
                <Col>
                  <Text type="secondary">
                    {Languages.t(
                      'scenes.app.popup.workspaceparameter.pages.deleteworkspace_description',
                    )}
                  </Text>
                </Col>

                <Col>
                  <Button
                    type="default"
                    onClick={() =>
                      workspace &&
                      ModalManager.open(<DeleteWorkspacePopup />, {
                        position: 'center',
                        size: { width: '600px' },
                      })
                    }
                    style={{ color: 'var(--error)', border: '1px solid var(--error)' }}
                  >
                    {Languages.t('general.delete')}
                  </Button>
                </Col>
              </Row>
            </Item>
          </Descriptions>
        </div>
        <input ref={uploadInputRef} type="file" style={{ display: 'none' }} />
      </Suspense>
    </>
  );
};

export default WorkspaceIdentity;
