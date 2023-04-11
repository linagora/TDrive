import React, { useState } from 'react';
import { Input, Row, Typography } from 'antd';

import { Application } from 'app/features/applications/types/application';
import Languages from 'app/features/global/services/languages-service';

const { Text, Link, Title } = Typography;
export const ApplicationAPI = ({
  application,
  onChangeApplicationAPI,
}: {
  application: Application;
  onChangeApplicationAPI?: (api: Application['api']) => void;
}) => {
  const [showApiPrivateKey, setShowApiPrivateKey] = useState<boolean>(false);
  return (
    <>
      <Row>
        <Title level={5}>
          {Languages.t('scenes.app.popup.appsparameters.pages.public_login_label')}
        </Title>
      </Row>
      <Row className="bottom-margin">
        <Text copyable>{application.id}</Text>
      </Row>
      <Row align="middle" className="small-bottom-margin">
        <Title level={5} className="small-right-margin" style={{ marginBottom: 0 }}>
          {Languages.t('scenes.app.popup.appsparameters.pages.app.private_key')}
        </Title>{' '}
        <Link onClick={() => setShowApiPrivateKey(!showApiPrivateKey)}>
          {showApiPrivateKey
            ? 'Hide'
            : Languages.t('scenes.app.popup.appsparameters.pages.show_button')}
        </Link>
      </Row>
      <Row className="bottom-margin">
        <Text
          copyable={{
            text: application.api?.private_key,
            onCopy: () => application.api?.private_key,
          }}
        >
          {showApiPrivateKey
            ? application.api?.private_key
            : '•••••••••••••••••••••••••••••••••••••'}
        </Text>
      </Row>

      <Row>
        <Title level={5}>
          {Languages.t('scenes.app.popup.appsparameters.pages.url_reception_events_label')}
        </Title>
      </Row>
      <Row className="bottom-margin">
        <Input
          placeholder={'https://domain.com/api/tdrive/events'}
          defaultValue={application.api?.hooks_url}
          onChange={e => {
            e.target.value &&
              onChangeApplicationAPI &&
              onChangeApplicationAPI({ ...application.api, hooks_url: e.target.value });
          }}
        />
      </Row>

      <Row>
        <Title level={5}>
          {Languages.t('scenes.app.popup.appsparameters.pages.autorised_ip_adresses_label')}
        </Title>
      </Row>
      <Row>
        <Row className="small-bottom-margin">
          <Text type="secondary">
            {Languages.t('scenes.app.popup.appsparameters.pages.filter_information')}
            {Languages.t('scenes.app.popup.appsparameters.pages.allowed_ip_adresses_method')}
          </Text>
        </Row>
        <Input
          defaultValue={application.api?.allowed_ips}
          placeholder={'ip1, ip2, ip3'}
          onChange={e => {
            e.target.value &&
              onChangeApplicationAPI &&
              onChangeApplicationAPI({ ...application.api, allowed_ips: e.target.value });
          }}
        />
      </Row>
    </>
  );
};
