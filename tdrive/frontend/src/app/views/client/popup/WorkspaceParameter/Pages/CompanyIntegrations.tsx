import React, { Suspense } from 'react';

import { Button, Row, Typography } from 'antd';

import Languages from 'app/features/global/services/languages-service';
import ApplicationsTable from './Applications/ApplicationsTable';
import CompanyApplicationsTable from './Applications/CompanyApplicationsTable';
import ApplicationCreator from '../../application-parameters/pages/application-creator';
import ModalManager from 'app/components/modal/modal-manager';
import AccessRightsService from 'app/features/workspace-members/services/workspace-members-access-rights-service';
import useRouterCompany from 'app/features/router/hooks/use-router-company';

import './Pages.scss';

export default () => {
  const companyId = useRouterCompany();

  return (
    <>
      <Row wrap={false} align="middle" justify="start">
        <Typography.Title level={1} style={{ marginBottom: 0, marginRight: 16 }}>
          {Languages.t('scenes.app.integrations_parameters.title')}
        </Typography.Title>

        {AccessRightsService.hasCompanyLevel(companyId, 'admin') && (
          <Button
            type="ghost"
            onClick={() =>
              ModalManager.open(<ApplicationCreator />, {
                position: 'center',
                size: { width: '600px', minHeight: '329px' },
              })
            }
          >
            {Languages.t('scenes.app.integrations_parameters.add_application')}
          </Button>
        )}
      </Row>

      <Suspense fallback={<></>}>
        <CompanyApplicationsTable />
        <ApplicationsTable />
      </Suspense>
    </>
  );
};
