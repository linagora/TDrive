import { Col, Row, Typography } from 'antd';
import Languages from 'app/features/global/services/languages-service';
import { ChevronsUp, ChevronUp } from 'react-feather';
const { Text } = Typography;

const RoleComponent = ({ text, icon }: { text: string; icon?: JSX.Element }): JSX.Element => (
  <Row align="middle">
    {!!icon && (
      <Col pull={1} style={{ height: 16 }}>
        {icon}
      </Col>
    )}
    <Col>
      <Text type="secondary" style={{ fontSize: 12 }}>
        {text}
      </Text>
    </Col>
  </Row>
);

export default ({ companyRole, workspaceRole }: { companyRole: string; workspaceRole: string }) => {
  // Company
  switch (companyRole) {
    case 'owner':
      return (
        <RoleComponent
          text={Languages.t('scenes.app.popup.appsparameters.pages.company_label')}
          icon={<ChevronsUp size={16} style={{ padding: 0 }} />}
        />
      );
    case 'admin':
      return (
        <RoleComponent
          text={Languages.t('general.user.role.company.admin')}
          icon={<ChevronsUp size={16} style={{ padding: 0 }} />}
        />
      );
    case 'guest':
      return <RoleComponent text={Languages.t('general.user.role.company.guest')} />;
  }

  // Workspace
  if (workspaceRole === 'moderator') {
    return (
      <RoleComponent
        text={Languages.t('scenes.app.popup.workspaceparameter.pages.moderator_status')}
        icon={<ChevronUp size={16} style={{ padding: 0 }} />}
      />
    );
  }

  return <></>;
};
