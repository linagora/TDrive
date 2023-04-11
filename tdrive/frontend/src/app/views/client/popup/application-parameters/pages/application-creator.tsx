import React, { useEffect, useState } from 'react';
import { Input, Row, Typography, Button, Col, Checkbox } from 'antd';

import Languages from 'app/features/global/services/languages-service';
import AlertManager from 'app/features/global/services/alert-manager-service';
import { useCurrentCompany } from 'app/features/companies/hooks/use-companies';
import ApplicationsAPIClient from 'app/features/applications/api/applications-api-client';
import {
  buildDefaultApplicationPayload,
  getApplicationIdentityCode,
} from 'app/features/applications/utils/application';
import ModalManager from 'app/components/modal/modal-manager';
import ObjectModal from 'app/components/object-modal/object-modal';
import { useCompanyApplications } from 'app/features/applications/hooks/use-company-applications';

import './pages.scss';
import ApplicationEditor from './application-editor';

type ErrorObjectStateType = { statusCode: number; message: string; error: string };

const ErrorComponent = ({ error }: { error: ErrorObjectStateType }) => (
  <Text type="danger">
    {/* TODO:translation here */}
    Error {error.statusCode}, {error.error} - {error.message}
  </Text>
);

const { Text, Title } = Typography;
const ApplicationCreator = () => {
  const { company } = useCurrentCompany();
  const [appName, setAppName] = useState<string | undefined>(undefined);
  const [appDescription, setAppDescription] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [checked, setChecked] = useState<boolean>(false);
  const [disabledBtn, setDisabledBtn] = useState<boolean>(true);
  const [error, setError] = useState<ErrorObjectStateType | undefined>(undefined);

  const { add: addOneCompanyApplication } = useCompanyApplications(company.id);

  const handleDisabledBtn = (inputValue?: string) => {
    if (inputValue?.length) {
      setDisabledBtn(false);
    }

    if (!inputValue?.length) {
      setDisabledBtn(true);
    }
  };

  useEffect(() => {
    handleDisabledBtn(appName);
  }, [appName]);

  const clearFields = () => {
    setAppName(undefined);
    setAppDescription(undefined);
    setDisabledBtn(true);
  };

  const createApp = async () => {
    setLoading(true);

    const applicationPayload = buildDefaultApplicationPayload();

    if (company.id) {
      applicationPayload.company_id = company.id;
    }

    if (appName) {
      applicationPayload.identity.name = appName;
      applicationPayload.identity.code = getApplicationIdentityCode(appName);
    }

    if (appDescription) {
      applicationPayload.identity.description = appDescription;
    }

    try {
      const application = await ApplicationsAPIClient.createCustomApplication(applicationPayload);

      if (application) {
        addOneCompanyApplication(application.id)
          .then(() => ModalManager.closeAll)
          .finally(() => {
            ModalManager.open(
              <ApplicationEditor application={application} companyId={company.id} />,
              {
                position: 'center',
                size: { width: 700 },
              },
            );
          });
      }
      // FIXME: This is no longer an application but an error
      const err = application as unknown as ErrorObjectStateType;

      if (err?.message?.length) {
        setError(err);
      }
    } catch (e) {
      console.error(e);
    }

    clearFields();

    setLoading(false);
  };

  return (
    <ObjectModal
      closable
      title={
        <Row align="middle" justify="start">
          <Title level={3} style={{ margin: 0 }}>
            {Languages.t('scenes.app.popup.appsparameters.pages.application_creator.title')}
          </Title>
        </Row>
      }
      footer={
        <Button
          type="primary"
          disabled={loading || disabledBtn || !checked}
          loading={loading}
          onClick={() => AlertManager.confirm(createApp)}
          style={{
            width: 'auto',
            float: 'right',
          }}
        >
          {Languages.t('scenes.app.popup.appsparameters.pages.create_my_app')}
        </Button>
      }
    >
      <div style={{ padding: '0 24px' }}>
        {error && (
          <Row className="small-bottom-margin">
            <ErrorComponent error={error} />
          </Row>
        )}

        <Row>
          <Title level={5}>
            {Languages.t('scenes.app.integrations_parameters.applications_table.name')}
          </Title>
        </Row>
        <Row className="bottom-margin">
          <Input
            placeholder={Languages.t('scenes.app.popup.appsparameters.pages.amazing_app_name')}
            type="text"
            disabled={loading}
            value={appName}
            onChange={e => setAppName(e.target.value)}
          />
        </Row>

        <Row wrap={false}>
          <Col className="small-right-margin">
            <Title level={5}>
              {Languages.t(
                'scenes.app.integrations_parameters.company_application_popup.tab_info.descriptions.description_item',
              )}
            </Title>
          </Col>
          <Col>
            <Text type="secondary">Optionnal</Text>
          </Col>
        </Row>
        <Row className="bottom-margin">
          <Input.TextArea
            placeholder={Languages.t(
              'scenes.app.popup.appsparameters.pages.amazing_app_description',
            )}
            disabled={loading}
            value={appDescription}
            onChange={e => setAppDescription(e.target.value)}
          />
        </Row>

        <Row className="small-bottom-margin">
          <Text type="secondary">
            <Checkbox
              className="small-right-margin"
              checked={checked}
              onChange={() => setChecked(!checked)}
            >
              {Languages.t('scenes.app.popup.appsparameters.pages.application_creator.checkbox')}
            </Checkbox>
          </Text>
        </Row>
      </div>
    </ObjectModal>
  );
};

export default ApplicationCreator;
