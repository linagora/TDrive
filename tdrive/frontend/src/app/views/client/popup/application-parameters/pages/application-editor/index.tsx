import React, { useState } from 'react';

import { isEqual } from 'lodash';
import { Tabs, Button, Typography, Col, Row, Divider } from 'antd';

import { Application } from 'app/features/applications/types/application';
import Languages from 'app/features/global/services/languages-service';
import AvatarComponent from 'app/components/avatar/avatar';
import ObjectModal from 'app/components/object-modal/object-modal';
import AlertManager from 'app/features/global/services/alert-manager-service';

import { ApplicationPublication } from './components/application-publication';
import { ApplicationIdentity } from './components/application-identity';
import { ApplicationAPI } from './components/application-api';
import { ApplicationDisplay } from './components/application-display';
import { ApplicationAccess } from './components/application-access';
import ApplicationsAPIClient from 'app/features/applications/api/applications-api-client';
import { useCompanyApplications } from 'app/features/applications/hooks/use-company-applications';
import ModalManager from 'app/components/modal/modal-manager';
import { ApplicationHelp } from './components/application-help';

import '../../../WorkspaceParameter/Pages/Applications/ApplicationsStyles.scss';

type PropsType = {
  application: Application;
  companyId: string;
};

const { TabPane } = Tabs;
const { Title } = Typography;

const ApplicationEditor = ({ application, companyId }: PropsType) => {
  const [updatedApp, setUpdatedApp] = useState<Application>(application);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { refresh } = useCompanyApplications(companyId);

  const onSave = async () => {
    setIsSaving(true);
    try {
      const res = await ApplicationsAPIClient.save(application.id, updatedApp);

      if (res) {
        refresh();

        ModalManager.close();
      }
    } catch (e) {
      console.error(e);
    }
    setIsSaving(false);
  };

  return (
    <ObjectModal
      className="company-application-popup"
      headerStyle={{ height: 32, marginTop: 24 }}
      footerDividerStyle={{ marginTop: 0 }}
      closable
      style={{ minHeight: 681, minWidth: 700 }}
      title={
        <Row align="middle" justify="start">
          <Col>
            <AvatarComponent
              url={application.identity.icon}
              fallback={`${process.env.PUBLIC_URL}/public/img/hexagon.png`}
            />
          </Col>
          <Col className="small-x-margin">
            <Title level={3} style={{ margin: 0 }}>
              {application.identity.name}
            </Title>
          </Col>
        </Row>
      }
      footer={
        <Row wrap={false}>
          <Button
            type="ghost"
            loading={isSaving}
            disabled={isEqual(application, updatedApp)}
            onClick={() => AlertManager.confirm(onSave)}
          >
            {Languages.t('general.save')}
          </Button>
        </Row>
      }
    >
      <Divider style={{ margin: '16px 0 0 0' }} />

      <Tabs defaultActiveKey="1" tabPosition="left">
        <TabPane tab={Languages.t('scenes.apps.account.identity')} key={1}>
          <ApplicationIdentity
            application={application}
            onChangeApplicationIdentity={identity => setUpdatedApp({ ...updatedApp, identity })}
          />
        </TabPane>

        <TabPane tab="API" key={2}>
          <ApplicationAPI
            application={application}
            onChangeApplicationAPI={api => setUpdatedApp({ ...updatedApp, api })}
          />
        </TabPane>

        <TabPane tab={Languages.t('scenes.app.popup.workspaceparameter.pages.show_button')} key={3}>
          <ApplicationHelp />
          <ApplicationDisplay
            application={application}
            onChangeApplicationDisplay={display => setUpdatedApp({ ...updatedApp, display })}
          />
        </TabPane>

        <TabPane tab="Access" key={4}>
          <ApplicationAccess
            application={application}
            onChangeApplicationAccess={access => setUpdatedApp({ ...updatedApp, access })}
          />
        </TabPane>

        <TabPane
          tab={Languages.t('scenes.app.popup.appsparameters.pages.publication_label')}
          key={5}
        >
          <ApplicationPublication application={application} />
        </TabPane>
      </Tabs>
    </ObjectModal>
  );
};

export default ApplicationEditor;
