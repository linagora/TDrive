import React from 'react';
import { Typography, Button } from 'antd';
import Banner from 'app/components/banner/banner';
import Emojione from 'app/components/emojione/emojione';
import Languages from 'app/features/global/services/languages-service';
import './locked-history-banner.scss';
import consoleService from 'app/features/console/services/console-service';
import useRouterCompany from 'app/features/router/hooks/use-router-company';

const { Title, Text } = Typography;
const LockedHistoryBanner = (): JSX.Element => {

  const companyId = useRouterCompany();

  const onClickBtn = () =>
    window.open(
      consoleService.getCompanySubscriptionUrl(companyId),
      'blank',
    );

  return (
    <Banner
      type="ghost"
      height={135}
      className="locked-history-banner"
      contentColumnStyle={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        width: '380px',
      }}
    >
      <div className="title-container">
        <Emojione type=":rocket:" s64 />
        <Title level={5} className="title">
          {Languages.t('components.locked_features.locked_history_banner.title')}
        </Title>
      </div>
      <Text type="secondary" className="description">
        {Languages.t('components.locked_features.locked_history_banner.description')}
      </Text>
      <Button type="primary" size="middle" onClick={onClickBtn} style={{ margin: '16px 0 16px 0' }}>
        {Languages.t('components.locked_features.locked_history_banner.button')}
      </Button>
    </Banner>
  );
};

export default LockedHistoryBanner;
