import React from 'react';
import { Input, Row, Typography } from 'antd';

import { Application } from 'app/features/applications/types/application';
import Languages from 'app/features/global/services/languages-service';

const { Title, Text } = Typography;
export const ApplicationIdentity = ({
  application,
  onChangeApplicationIdentity,
}: {
  application: Application;
  onChangeApplicationIdentity?: (identity: Application['identity']) => void;
}) => (
  <>
    <Row>
      <Title level={5}>
        {Languages.t('scenes.app.integrations_parameters.applications_table.name')}
      </Title>
    </Row>
    <Row className="bottom-margin">
      <Input
        placeholder={Languages.t('scenes.app.popup.appsparameters.pages.amazing_app_name')}
        defaultValue={application.identity.name}
        onChange={e =>
          onChangeApplicationIdentity &&
          onChangeApplicationIdentity({
            ...application.identity,
            name: e.target.value,
          })
        }
      />
    </Row>

    <Row>
      <Title level={5}>{Languages.t('components.richtexteditor.toolbar.code')}</Title>
    </Row>
    <Row className="bottom-margin">
      <Input
        placeholder={'my_amazing_app'}
        defaultValue={application.identity.code}
        onChange={e => {
          onChangeApplicationIdentity &&
            onChangeApplicationIdentity({ ...application.identity, code: e.target.value });
        }}
      />
    </Row>

    <Row align="middle">
      <Title level={5} className="small-right-margin" style={{ marginBottom: 0 }}>
        {Languages.t('scenes.app.popup.appsparameters.pages.icon')}
      </Title>

      <Text type="secondary">
        {Languages.t('scenes.app.popup.appsparameters.pages.optimal_format')}
      </Text>
    </Row>
    <Row className="bottom-margin">
      <Input
        placeholder={'https://domain.com/my_icon.png'}
        defaultValue={application.identity.icon}
        onChange={e =>
          onChangeApplicationIdentity &&
          onChangeApplicationIdentity({
            ...application.identity,
            icon: e.target.value,
          })
        }
      />
    </Row>

    <Row>
      <Title level={5}>{Languages.t('scenes.app.popup.appsparameters.pages.website_label')}</Title>
    </Row>
    <Row className="bottom-margin">
      <Input
        placeholder={'https://domain.com/'}
        defaultValue={application.identity.website}
        onChange={e =>
          onChangeApplicationIdentity &&
          onChangeApplicationIdentity({
            ...application.identity,
            website: e.target.value,
          })
        }
      />
    </Row>

    <Row>
      <Title level={5}>
        {Languages.t('scenes.app.popup.appsparameters.pages.description_label')}
      </Title>
    </Row>
    <Row>
      <Input.TextArea
        placeholder={Languages.t('scenes.app.popup.appsparameters.pages.description_label')}
        defaultValue={application.identity.description}
        rows={4}
        onChange={e =>
          onChangeApplicationIdentity &&
          onChangeApplicationIdentity({
            ...application.identity,
            description: e.target.value,
          })
        }
      />
    </Row>
  </>
);
