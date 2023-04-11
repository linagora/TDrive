import React, { useState } from 'react';
import { Button, Row, Typography } from 'antd';
import ObjectModal from '../../object-modal/object-modal';
import Languages from 'app/features/global/services/languages-service';
import ConsoleService from 'app/features/console/services/console-service';

type PropsType = {
  daysLeft: number;
  limit: number;
  email: string;
};

export default ({ daysLeft, email, limit }: PropsType): JSX.Element => {
  const [loading, setLoading] = useState<boolean>(false);

  const onClickButton = () => {
    setLoading(true);
    return ConsoleService.verifyMail().finally(() => setLoading(false));
  };

  return (
    <ObjectModal
      closable
      title={Languages.t('components.account_verification_status_sentence', [
        Languages.t('components.account_verication_status_unverified'),
      ])}
      titleColor="var(--white)"
      titleCenter
      headerStyle={{ backgroundColor: 'var(--red)', color: 'var(--white)', height: 76 }}
      hideFooterDivider
      footerAlign="center"
      footer={
        <Button type="ghost" size="small" onClick={onClickButton} loading={loading}>
          {Languages.t('general.re_send')}
        </Button>
      }
    >
      <Row justify="center" style={{ marginTop: 32, height: 68 }}>
        <Typography.Text
          type="danger"
          style={{
            width: 435,
            textAlign: 'center',
            margin: 0,
          }}
        >
          {Languages.t('components.unverified_account.typography_text_danger', [daysLeft, limit])}
        </Typography.Text>
      </Row>

      <Row justify="center" style={{ marginTop: 12, height: 22 }}>
        <Typography.Text
          style={{
            textAlign: 'center',
          }}
        >
          {Languages.t('components.unverified_account.verification_details')}
        </Typography.Text>
      </Row>

      <Row justify="center" style={{ marginTop: 12 }}>
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

      <Row justify="center" style={{ marginTop: 32, marginBottom: 8 }}>
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
    </ObjectModal>
  );
};
