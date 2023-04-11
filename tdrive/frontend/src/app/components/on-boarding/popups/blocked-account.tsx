/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import { Button, Row, Typography } from 'antd';
import ObjectModal from '../../object-modal/object-modal';
import Languages from 'app/features/global/services/languages-service';
import ConsoleService from 'app/features/console/services/console-service';
import LoginService from 'app/features/auth/login-service';

type PropsType = {
  email: string;
};

export default ({ email }: PropsType): JSX.Element => {
  const [loading, setLoading] = useState<boolean>(false);

  const onClickButton = () => {
    setLoading(true);
    return ConsoleService.verifyMail().finally(() => setLoading(false));
  };

  return (
    <ObjectModal
      title={Languages.t('components.account_verification_status_sentence', [
        Languages.t('components.account_verication_status_blocked'),
      ])}
      titleColor="var(--white)"
      titleCenter
      headerStyle={{ backgroundColor: 'var(--red)', color: 'var(--white)', height: 76 }}
      hideFooterDivider
      footerAlign="center"
      footer={
        <>
          <Button type="ghost" size="small" onClick={onClickButton} loading={loading}>
            {Languages.t('general.re_send')}
          </Button>

          <Row justify="center" style={{ marginTop: 16 }}>
            <a className="blue_link" onClick={() => LoginService.logout()}>
              {Languages.t('scenes.apps.account.account.logout')}
            </a>
          </Row>
        </>
      }
    >
      <Row justify="center" style={{ marginTop: 36 }}>
        <Typography.Title
          level={3}
          style={{
            textAlign: 'center',
            margin: 0,
            width: 493,
          }}
        >
          {Languages.t('components.blocked_account.trial_period_over')}
        </Typography.Title>
      </Row>

      <Row justify="center" style={{ marginTop: 24 }}>
        <Typography.Text
          style={{
            textAlign: 'center',
            height: 22,
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
