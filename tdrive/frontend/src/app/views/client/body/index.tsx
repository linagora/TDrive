// eslint-disable-next-line @typescript-eslint/no-use-before-define
import { Layout } from 'antd';
import { FC, useEffect, useState } from 'react';

import AccountStatusComponent from 'app/components/on-boarding/account-status-component';
import CompanyBillingBanner from 'app/components/on-boarding/company-billing-banner';
import useRouterChannel from 'app/features/router/hooks/use-router-channel';
import useRouterCompany from 'app/features/router/hooks/use-router-company';
import useRouterWorkspace from 'app/features/router/hooks/use-router-workspace';
import Drive from './drive';

type PropsType = {
  className?: string;
};

const MainView: FC<PropsType> = ({ className }) => {
  const companyId = useRouterCompany();
  const workspaceId = useRouterWorkspace();
  const channelId = useRouterChannel();

  return (
    <div className={'grow min-h-full relative ' + (className ? className : '')}>
      <AccountStatusComponent />
      {companyId && <CompanyBillingBanner companyId={companyId || ''} />}
      <MainContentWrapper key={companyId + workspaceId + channelId} />
    </div>
  );
};

//This is used to delay render and make rest of UI faster
export const MainContentWrapper = () => {
  const [delayed, setDelayed] = useState(true);
  const companyId = useRouterCompany();
  const workspaceId = useRouterWorkspace();

  //This delay make the app superfast
  useEffect(() => {
    setTimeout(() => setDelayed(false), 50);
  }, []);

  if (delayed) {
    return <></>;
  }

  return (
    <Drive
      context={{
        companyId,
        workspaceId,
      }}
    />
  );
};

export default ({ className }: PropsType) => {
  return <MainView className={className} />;
};
