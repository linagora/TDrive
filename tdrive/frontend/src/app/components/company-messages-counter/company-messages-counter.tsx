import React, { useEffect, useState } from 'react';
import { Col, Progress, Row, Typography } from 'antd';
import './company-messages-counter.scss';
import i18n from 'i18next';

import Languages from 'app/features/global/services/languages-service';
import { useCurrentCompany } from 'app/features/companies/hooks/use-companies';
import FeatureTogglesService, {
  FeatureNames,
} from 'app/features/global/services/feature-toggles-service';
import MessageHistoryService from 'app/features/messages/services/message-history-service';
import consoleService from 'app/features/console/services/console-service';

const { Text, Title, Link } = Typography;
const CompanyMessagesCounter = () => {
  const [messagesCount, setMessagesCount] = useState<number>(1);
  const companyMessagesLimit = MessageHistoryService.getLimitCompanyMessages();

  const { company } = useCurrentCompany();

  const companySubscriptionUrl = consoleService.getCompanySubscriptionUrl(company.id);

  const onClickLink = () => window.open(companySubscriptionUrl, 'blank');

  useEffect(() => {
    if (company) {
      setMessagesCount(company.stats?.total_messages || 1);
    }
  }, [company]);

  return !FeatureTogglesService.isActiveFeatureName(FeatureNames.MESSAGE_HISTORY) ? (
    <>
      <Row
        justify="space-around"
        align="middle"
        wrap={false}
        style={{
          padding: '0px 0px',
          width: '100%',
        }}
      >
        <Col className="small-left-margin companyMessagesCounter" style={{ lineHeight: '16px' }}>
          <Title level={4}>
            {Languages.t('scenes.app.channelsbar.currentuser.company_messages_counter_header', [])}
          </Title>
          <Text className="info">
            {Languages.t('scenes.app.channelsbar.currentuser.company_messages_counter_info', [
              Intl.NumberFormat(i18n.language).format(companyMessagesLimit),
            ])}
          </Text>
          <div className="link">
            <Link onClick={onClickLink}>
              {Languages.t('scenes.app.channelsbar.currentuser.company_messages_counter_link', [])}
            </Link>
          </div>
        </Col>
        <Col>
          <Progress
            type="circle"
            format={() => (messagesCount / 1000).toFixed(1) + 'k'}
            percent={(messagesCount / companyMessagesLimit) * 100}
            width={55}
          />
        </Col>
      </Row>
    </>
  ) : (
    <></>
  );
};
export default CompanyMessagesCounter;
