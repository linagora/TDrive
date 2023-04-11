import React from 'react';
import { Row, Typography } from 'antd';
import Banner from '../banner/banner';
import { CompanyType } from 'app/features/companies/types/company';
import Groups from 'app/deprecated/workspaces/groups.js';
import Languages from 'app/features/global/services/languages-service';
import { AlertTriangle } from 'react-feather';
import consoleService from 'app/features/console/services/console-service';

type PropsType = {
  companyId: string;
};

const { Link } = Typography;
export default ({ companyId }: PropsType): JSX.Element => {
  const companySubscriptionUrl = consoleService.getCompanySubscriptionUrl(companyId);
  const userGroups: { [key: string]: CompanyType } = Groups.user_groups;
  const currentUserGroup = userGroups[companyId];
  const isCurrentUserAdminOrOwner =
    currentUserGroup?.role === 'admin' || currentUserGroup?.role === 'owner';

  const onClickLink = () => window.open(companySubscriptionUrl, 'blank');

  const shouldDisplayBanner = currentUserGroup?.plan?.billing?.status === 'warning';
  return shouldDisplayBanner ? (
    <Banner type="important">
      <Row align="middle">
        <AlertTriangle size={24} />
        <div className="small-x-margin">
          {Languages.t(
            isCurrentUserAdminOrOwner
              ? 'components.on_boarding.company_billing_banner.admin_or_owner_text'
              : 'components.on_boarding.company_billing_banner.guest_or_member_text',
          )}
        </div>
        {isCurrentUserAdminOrOwner && (
          <Link onClick={onClickLink}>
            {Languages.t('components.on_boarding.company_billing_banner.link')}
          </Link>
        )}
      </Row>
    </Banner>
  ) : (
    <></>
  );
};
