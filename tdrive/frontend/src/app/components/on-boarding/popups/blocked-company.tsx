import React from 'react';
import { Button, Row, Typography, Select } from 'antd';
import ObjectModal from '../../object-modal/object-modal';
import Languages from 'app/features/global/services/languages-service';
import LoginService from 'app/features/auth/login-service';
import { CompanyType } from 'app/features/companies/types/company';
import { capitalize } from 'lodash';
import ModalManager from 'app/components/modal/modal-manager';
import UserService from 'app/features/users/services/current-user-service';
import Groups from 'app/deprecated/workspaces/groups.js';
import { AlertTriangle } from 'react-feather';
import consoleService from 'app/features/console/services/console-service';
import useRouterCompany from 'app/features/router/hooks/use-router-company';

type SwitchCompanyPropsType = {
  placeholder?: string;
  companiesIds: string[];
};

const { Option } = Select;
const { Text, Title } = Typography;
const SwitchCompany = ({ placeholder, companiesIds }: SwitchCompanyPropsType): JSX.Element => {
  const userGroups: { [key: string]: CompanyType } = Groups.user_groups;
  const companies = companiesIds
    .map(id => userGroups[id])
    .filter(company => company.plan?.billing?.status !== 'error');

  const onSelect = (companyId: string) => {
    Groups.select(userGroups[companyId]);
    return ModalManager.close();
  };

  const onClickBtn = () => LoginService.logout();

  return (
    (!!companies.length && (
      <Select
        placeholder={placeholder || 'Select a company'}
        onSelect={onSelect}
        style={{ width: 224 }}
      >
        {companies.map(company => (
          <Option key={company.id} value={company.id}>
            {capitalize(company.name)}
          </Option>
        ))}
      </Select>
    )) || (
      <Button
        type="primary"
        style={{ height: 36, width: 163, backgroundColor: 'var(--red)' }}
        onClick={onClickBtn}
      >
        {Languages.t('scenes.app.channelsbar.currentuser.logout')}
      </Button>
    )
  );
};

export default (): JSX.Element => {
  const companyId = useRouterCompany();
  const onClickButton = () =>
    window.open(
      consoleService.getCompanySubscriptionUrl(companyId),
      'blank',
    );

  return (
    <ObjectModal
      title={
        <div style={{ display: 'flex' }}>
          <AlertTriangle size={24} />
          <span className="small-left-margin">
            {Languages.t('components.on_boarding.popups.blocked_company.title')}
          </span>
        </div>
      }
      titleColor="var(--white)"
      titleCenter
      headerStyle={{ backgroundColor: 'var(--red)', color: 'var(--white)', height: 76 }}
      hideFooterDivider
      footerAlign="center"
      footerStyle={{ marginBottom: 24 }}
      footer={
        <Row justify="space-between" align="middle">
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: 32,
            }}
          >
            <Button type="ghost" size="large" onClick={onClickButton}>
              {Languages.t(
                'components.on_boarding.popups.blocked_company.company_subscription_plan_button',
              )}
            </Button>
            <Text style={{ margin: '8px 0 ' }} strong>
              {Languages.t('components.on_boarding.popups.blocked_company.or')}
            </Text>
            <SwitchCompany
              placeholder={Languages.t(
                'components.on_boarding.popups.blocked_company.company_selector',
              )}
              companiesIds={[...(UserService.getCurrentUser()?.groups_id || [])]}
            />
          </div>
        </Row>
      }
    >
      <Row justify="center" style={{ marginTop: 36 }}>
        <Title
          level={3}
          style={{
            textAlign: 'center',
            margin: 0,
            width: 493,
          }}
        >
          {Languages.t('components.on_boarding.popups.blocked_company.description')}
        </Title>
      </Row>

      <Row justify="center" style={{ marginTop: 32, marginBottom: 8 }}>
        <Text
          style={{
            textAlign: 'center',
            fontSize: 15,
            height: '22px',
          }}
        >
          {Languages.t('components.on_boarding.popups.blocked_company.learn_more_text')}
        </Text>
      </Row>
    </ObjectModal>
  );
};
