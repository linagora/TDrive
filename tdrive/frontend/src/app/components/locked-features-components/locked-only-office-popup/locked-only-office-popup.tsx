import React from 'react';
import ObjectModal from 'app/components/object-modal/object-modal';
import { Button, Row, Typography } from 'antd';
import ModalManager from 'app/components/modal/modal-manager';
import Languages from 'app/features/global/services/languages-service';
import useRouterCompany from 'app/features/router/hooks/use-router-company';
import consoleService from 'app/features/console/services/console-service';

const { Title, Text } = Typography;
export default () => {
  const companyId = useRouterCompany();
  return (
  <ObjectModal
    titleCenter
    titleLevel={2}
    title={Languages.t('components.locked_features.locked_only_office_popup.title')}
    titleTypographyStyle={{ textAlign: 'center', marginBottom: 32 }}
    style={{ padding: 32 }}
    contentStyle={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
    footer={
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 32 }}
      >
        <Button
          type="primary"
          size="large"
          style={{ marginTop: 8 }}
          onClick={() =>
            window.open(
              consoleService.getCompanySubscriptionUrl(companyId),
              'blank',
            )
          }
        >
          {Languages.t('components.locked_features.locked_guests_popup.learn_more_button')}
        </Button>
        <Text style={{ margin: '16px 0 ' }} strong>
          {Languages.t('components.locked_features.locked_guests_popup.or')}
        </Text>
        <Button
          type="ghost"
          style={{ height: 36, width: 163 }}
          onClick={() => ModalManager.closeAll()}
        >
          {Languages.t('components.locked_features.locked_guests_popup.skip_for_now_button')}
        </Button>
      </div>
    }
    hideFooterDivider
    footerAlign="center"
    footerStyle={{ marginBottom: 16 }}
  >
    <Row justify="center" align="middle" className="bottom-margin">
      <Title
        level={3}
        children={Languages.t('components.locked_features.locked_only_office_popup.subtitle')}
        style={{
          textAlign: 'center',
          margin: 0,
          height: 54,
        }}
      />
    </Row>

    <Row justify="center">
      <Text
        style={{
          textAlign: 'center',
          width: '404px',
        }}
        children={Languages.t('components.locked_features.locked_only_office_popup.text')}
      />
    </Row>
  </ObjectModal>
)};
