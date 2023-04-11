import React from 'react';
import { capitalize } from 'lodash';
import { Row, Typography } from 'antd';

import { TagPicker } from './tag-picker';
import { defaultApplicationScopes } from '../default-scopes';
import {
  Application,
  ApplicationAccess as ApplicationAccessType,
  ApplicationScopes,
} from 'app/features/applications/types/application';
import { ApplicationHelp } from './application-help';
import Languages from 'app/features/global/services/languages-service';

const { Text, Title } = Typography;
export const ApplicationAccess = ({
  application,
  onChangeApplicationAccess,
}: {
  application: Application;
  onChangeApplicationAccess?: (api: Application['access']) => void;
}) => {
  return (
    <>
      <Row>
        <Title level={3}>{Languages.t('tdrive.application.access.title')}</Title>
      </Row>
      <Row className="small-bottom-margin">
        <ApplicationHelp />
      </Row>
      {Object.keys(application.access).map((key: string) => {
        const currentScopes: ApplicationScopes[] = (application.access as ApplicationAccessType)[
          key as keyof ApplicationAccessType
        ];
        return (
          <div key={key === 'hooks' ? 'listened events' : key} className="bottom-margin">
            <Row>
              <Title level={5}>{capitalize(key === 'hooks' ? 'listened events' : key)}</Title>
            </Row>
            {defaultApplicationScopes ? (
              <TagPicker
                defaulActiveTags={currentScopes}
                onChange={tags =>
                  onChangeApplicationAccess &&
                  onChangeApplicationAccess({ ...application.access, [key]: tags })
                }
              />
            ) : (
              <Text type="secondary">
                {Languages.t('tdrive.application.access.no_default_scopes_available', [key])}
              </Text>
            )}
          </div>
        );
      })}
    </>
  );
};
