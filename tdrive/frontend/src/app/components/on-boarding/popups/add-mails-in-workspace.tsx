import React, { useState } from 'react';
import { Button, Col, Row, Typography } from 'antd';
import AutoHeight from '../../auto-height/auto-height';
import ObjectModal from '../../object-modal/object-modal';
import Languages from 'app/features/global/services/languages-service';
import ModalManager from 'app/components/modal/modal-manager';
import ConsoleService from 'app/features/console/services/console-service';
import RouterServices from 'app/features/router/services/router-service';
import WorkspacesUsers from 'app/features/workspace-members/services/workspace-members-service';

export default (): JSX.Element => {
  const { companyId, workspaceId } = RouterServices.getStateFromRoute();
  const [emails, _setEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const setEmails = (str: string) =>
    _setEmails(WorkspacesUsers.fullStringToEmails(str) as string[]);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setEmails(e.target.value);

  const onClickButton = async () => {
    setLoading(true);

    return await ConsoleService.addMailsInWorkspace({
      workspace_id: workspaceId || '',
      company_id: companyId || '',
      emails,
    }).finally(() => {
      setLoading(false);
      return ModalManager.close();
    });
  };

  return (
    <ObjectModal
      title={Languages.t('components.add_mails_workspace.title_1')}
      closable
      style={{ height: 600 }}
      titleLevel={2}
      titleCenter
      hideFooterDivider
      footerAlign="center"
      footer={
        <Row className="x-margin" justify="center">
          <Button onClick={onClickButton} type="primary" size="large" loading={loading}>
            {Languages.t('components.add_mails_workspace.button')}
          </Button>
        </Row>
      }
    >
      <Row
        className="x-margin"
        style={{ padding: '0 16px', marginTop: 16, marginBottom: 62 }}
        justify="center"
      >
        <Typography.Text
          style={{ textAlign: 'center', width: '464px', fontSize: 17, height: '44px' }}
        >
          {Languages.t('components.add_mails_workspace.title_2')}
        </Typography.Text>
      </Row>

      <Row className="x-margin" style={{ marginBottom: 12, paddingTop: 32 }} justify="center">
        <Col style={{ width: 400 }}>
          <AutoHeight
            minHeight="110px"
            maxHeight="300px"
            onChange={onChange}
            placeholder={Languages.t('components.add_mails_workspace.text_area_placeholder')}
          />
        </Col>
      </Row>

      <Row className="x-margin" style={{ display: 'flex', justifyContent: 'center' }}>
        <Typography.Text type="secondary" style={{ width: 380, fontSize: 13, height: 32 }}>
          {Languages.t('scenes.app.popup.adduser.adresses_message')}
        </Typography.Text>
      </Row>
    </ObjectModal>
  );
};
