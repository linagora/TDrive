import { Button, Row, Typography } from 'antd';
import ObjectModal from 'app/components/object-modal/object-modal';
import React from 'react';
import ModalManager from 'app/components/modal/modal-manager';
import Languages from 'app/features/global/services/languages-service';
import Emojione from 'app/components/emojione/emojione';

type PropsType = {
  companySubscriptionUrl: string;
};

const LockedGuestsPopup = ({ companySubscriptionUrl }: PropsType): JSX.Element => {
  const onClickLearnMore = () => window.open(companySubscriptionUrl, 'blank');
  const onClickSkipForNow = () => ModalManager.close();

  return (
    <ObjectModal
      titleCenter
      titleLevel={2}
      title={
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {Languages.t('components.locked_features.locked_guests_popup.title')}
          <Emojione type=":lock:" s128 />
        </div>
      }
      style={{ padding: 32 }}
      hideFooterDivider
      footerAlign="center"
      footerStyle={{ marginBottom: 16 }}
      footer={
        <div
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 32 }}
        >
          <Button type="primary" size="large" onClick={onClickLearnMore}>
            {Languages.t('components.locked_features.locked_guests_popup.learn_more_button')}
          </Button>
          <Typography.Text style={{ margin: '16px 0 ' }} strong>
            {Languages.t('components.locked_features.locked_guests_popup.or')}
          </Typography.Text>
          <Button type="ghost" style={{ height: 36, width: 163 }} onClick={onClickSkipForNow}>
            {Languages.t('components.locked_features.locked_guests_popup.skip_for_now_button')}
          </Button>
        </div>
      }
    >
      <Row justify="center" style={{ margin: '12px 0 32px 0', height: '25px' }}>
        <Typography.Title
          level={3}
          style={{
            textAlign: 'center',
            margin: 0,
          }}
        >
          {Languages.t('components.locked_features.locked_guests_popup.subtitle')}
        </Typography.Title>
      </Row>

      <Row justify="center">
        <Typography.Text
          style={{
            textAlign: 'center',
            width: '404px',
          }}
        >
          {Languages.t('components.locked_features.locked_guests_popup.description')}
        </Typography.Text>
      </Row>
    </ObjectModal>
  );
};

export default LockedGuestsPopup;
