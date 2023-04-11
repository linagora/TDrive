import React from 'react';

import Banner from 'app/components/banner/banner';
import { Button, Typography } from 'antd';
import Languages from 'app/features/global/services/languages-service';
import ModalManager from 'app/components/modal/modal-manager';
import UnverifiedAccount from './popups/unverified-account';
import BlockedAccount from './popups/blocked-account';
import InitService from 'app/features/global/services/init-service';
import { useCurrentUser } from 'app/features/users/hooks/use-current-user';

const AccountStatusComponent = (): JSX.Element => {
  const { user } = useCurrentUser();
  const maxUnverifiedDays =
    InitService.server_infos?.configuration?.accounts?.remote?.max_unverified_days || 7;
  const oneDay = 1000 * 60 * 60 * 24;
  const periodLimit = (user?.created_at || 0) + maxUnverifiedDays * oneDay;
  const daysLeft = Math.ceil((periodLimit - Date.now()) / oneDay);

  if (!user || InitService.server_infos?.configuration?.accounts?.type !== 'remote') {
    return <></>;
  }

  const showBlockedModal = () => {
    if (InitService.server_infos?.configuration?.accounts?.type === 'remote')
      return ModalManager.open(
        <BlockedAccount email={user?.email} />,
        {
          position: 'center',
          size: { width: '600px' },
        },
        false,
      );
  };

  const showUnverifiedModal = () => {
    if (InitService.server_infos?.configuration?.accounts?.type === 'remote')
      return ModalManager.open(
        <UnverifiedAccount daysLeft={daysLeft} limit={maxUnverifiedDays} email={user.email} />,
        {
          position: 'center',
          size: { width: '600px' },
        },
      );
  };

  if (!user.is_verified && daysLeft <= 0) {
    showBlockedModal();
  }

  const showBanner = !user.is_verified;
  return (
    <>
      {showBanner && (
        <Banner
          type="important"
          content={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Typography.Title level={5} style={{ marginBottom: 0, color: 'var(--white)' }}>
                {Languages.t('components.account_verification_status_sentence', [
                  Languages.t('components.account_verication_status_unverified'),
                ])}
              </Typography.Title>
              <Button
                style={{ marginLeft: 17, height: 32, color: 'var(--red)' }}
                onClick={showUnverifiedModal}
              >
                {Languages.t('general.verify')}
              </Button>
            </div>
          }
        />
      )}
    </>
  );
};

export default AccountStatusComponent;
