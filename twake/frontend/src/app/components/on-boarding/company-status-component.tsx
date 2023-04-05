import React, { useEffect } from 'react';
import ModalManager from 'app/components/modal/modal-manager';
import UserService from 'app/features/users/services/current-user-service';
import WelcomeOnTdrive from './popups/welcome-on-tdrive';
import DepreciatedCollections from 'app/deprecated/CollectionsV1/Collections/Collections.js';
import InitService from 'app/features/global/services/init-service';
import Groups from 'app/deprecated/workspaces/groups.js';
import { CompanyType } from 'app/features/companies/types/company';
import BlockedCompany from './popups/blocked-company';
import useRouterCompany from 'app/features/router/hooks/use-router-company';
import useRouterWorkspace from 'app/features/router/hooks/use-router-workspace';

const CompanyStatusComponent = (): JSX.Element => {
  const companyId = useRouterCompany();
  const workspaceId = useRouterWorkspace();
  const user = UserService.getCurrentUser();
  const onboarding: string | null = localStorage.getItem(`onboarding_${companyId}`);
  const workspace = DepreciatedCollections.get('workspaces').find(workspaceId);

  useEffect(() => {
    if (InitService.server_infos?.configuration?.accounts?.type === 'remote') {
      isNewAccount();
    }

    isBlockedCompany();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const isNewCompany = (): boolean => {
    const oneDay = 1000 * 60 * 60 * 24;
    const createdDay = workspace?.group?.stats?.created_at;
    const currentDay = Date.now();
    const currentPeriod = Math.round(Math.round(currentDay - createdDay) / oneDay);

    return currentPeriod <= 7 ? true : false;
  };

  const isNewAccount = () => {
    if (!workspace?.id) return;

    const isNewUser: boolean =
      onboarding !== 'completed' &&
      workspace?.group?.stats?.total_members <= 1 &&
      isNewCompany() &&
      !user?.is_verified;

    if (isNewUser) {
      localStorage.setItem(`onboarding_${companyId}`, 'completed');
      return ModalManager.open(<WelcomeOnTdrive email={user.email} />, {
        position: 'center',
        size: { width: '600px' },
      });
    }
  };

  const isBlockedCompany = () => {
    if (!companyId) return;
    const userGroups: { [key: string]: CompanyType } = Groups.user_groups;
    const currentGroup = userGroups[companyId];

    if (currentGroup?.plan?.billing?.status === 'error') {
      return ModalManager.open(
        <BlockedCompany />,
        {
          position: 'center',
          size: { width: '600px' },
        },
        false,
      );
    }
  };

  return <></>;
};

export default CompanyStatusComponent;
