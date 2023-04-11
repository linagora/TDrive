import { Button, Row, Typography } from 'antd';
import React, { useState } from 'react';
import Emojione from '../../emojione/emojione';
import ObjectModal from '../../object-modal/object-modal';
import Languages from 'app/features/global/services/languages-service';
import ModalManager from 'app/components/modal/modal-manager';
import AddMailsInWorkspace from './add-mails-in-workspace';
import ConsoleService from 'app/features/console/services/console-service';

type PropsType = {
  email: string;
};

export default ({ email }: PropsType) => {
  const [loading, setLoading] = useState<boolean>(false);
  const openAddMembers = () =>
    ModalManager.open(<AddMailsInWorkspace />, {
      position: 'center',
      size: { width: '600px' },
    });

  const onClickButton = () => {
    setLoading(true);
    return ConsoleService.verifyMail().finally(() => setLoading(false));
  };

  return (
    <ObjectModal
      title={
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {Languages.t('components.verify_mail.title_1')}
          <Emojione type=":partying_face:" s128 />
        </div>
      }
      closable
      style={{ height: 600 }}
      titleLevel={2}
      titleCenter
      footerAlign="center"
      hideFooterDivider
      footer={
        <Button onClick={openAddMembers} type="primary" size="large">
          {Languages.t('components.verify_mail.button')}
        </Button>
      }
    >
      <Row justify="center" style={{ margin: '12px 0 54px 0', height: '25px' }}>
        <Typography.Title
          level={3}
          style={{
            textAlign: 'center',
            margin: 0,
          }}
        >
          {Languages.t('components.verify_mail.title_2')}
        </Typography.Title>
      </Row>
      <Row justify="center" style={{ marginBottom: '12px', height: '44px' }}>
        <Typography.Text
          style={{
            textAlign: 'center',
            width: '396px',
            height: '44px',
          }}
        >
          {Languages.t('components.verify_mail.text')}
        </Typography.Text>
      </Row>

      <Row justify="center" style={{ marginBottom: 32 }}>
        <Typography.Text
          strong
          style={{
            textAlign: 'center',
            height: '22px',
          }}
        >
          {email}
        </Typography.Text>
      </Row>

      <Row justify="center" style={{ marginBottom: 32, height: '44px' }}>
        <Typography.Paragraph
          style={{
            width: '393px',
            textAlign: 'center',
            height: '44px',
          }}
        >
          {Languages.t('components.verify_mail.paragraph')}
        </Typography.Paragraph>
      </Row>

      <Row justify="center" style={{ marginBottom: 8 }}>
        <Typography.Text
          style={{
            textAlign: 'center',
            fontSize: 15,
            height: '22px',
          }}
        >
          {Languages.t('components.unverified_account.re_send_email')}
        </Typography.Text>
      </Row>

      <Row justify="center" style={{ marginBottom: 104 }}>
        <Button type="ghost" size="small" onClick={onClickButton} loading={loading}>
          {Languages.t('general.re_send')}
        </Button>
      </Row>
    </ObjectModal>
  );
};
