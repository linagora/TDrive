import React, { useEffect, useState } from 'react';
import { Button, Typography } from 'antd';
import Languages from 'app/features/global/services/languages-service';
import popupManager from 'app/deprecated/popupManager/popupManager.js';
import AutoHeight from 'app/components/auto-height/auto-height';
import ConsoleService from 'app/features/console/services/console-service';
import WorkspacesUsers from 'app/features/workspace-members/services/workspace-members-service';
import MagicLinks from './MagicLinks';
import useRouterWorkspace from 'app/features/router/hooks/use-router-workspace';
import useRouterCompany from 'app/features/router/hooks/use-router-company';

import './AddUser.scss';
import LockedInviteAlert from 'app/components/locked-features-components/locked-invite-alert';
import { useFeatureToggles } from 'app/components/locked-features-components/feature-toggles-hooks';
import FeatureTogglesService from 'app/features/global/services/feature-toggles-service';
import { useCurrentCompany } from 'app/features/companies/hooks/use-companies';

type PropsType = {
  [key: string]: unknown;
  noMagicLink?: boolean;
  inline?: boolean;
  onChange?: (emails: string[]) => void;
  finish?: () => void;
  loading?: boolean;
};

export default (props: PropsType): JSX.Element => {
  const companyId = useRouterCompany();
  const workspaceId = useRouterWorkspace();
  const { FeatureNames } = useFeatureToggles();
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emails, _setEmails] = useState<string[]>([]);

  const { company, refresh } = useCurrentCompany();
  const setEmails = (str: string) => _setEmails(WorkspacesUsers.fullStringToEmails(str));

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setEmails(e.target.value);

  const onClickBtn = async () => {
    if (props.onChange) {
      props.onChange(emails);
    }

    if (props.finish) {
      props.finish();
      return;
    }
    setLoading(true);
    setDisabled(true);

    return await ConsoleService.addMailsInWorkspace({
      workspace_id: workspaceId || '',
      company_id: companyId || '',
      emails,
    }).finally(() => {
      setLoading(false);
      setDisabled(false);
      refresh();
      return close();
    });
  };

  const close = () => {
    if (props.inline) {
      return;
    }
    setTimeout(() => {
      popupManager.close();
    }, 200);
  };

  useEffect(() => {
    refresh();
    if (!FeatureTogglesService.isActiveFeatureName(FeatureNames.COMPANY_INVITE_MEMBER))
      setDisabled(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company.stats?.total_members]);

  return (
    <div className="add-user-from-tdrive-console">
      <Typography.Title level={3}>
        {Languages.t('scenes.app.workspaces.create_company.invitations.title_2')}{' '}
      </Typography.Title>

      {!FeatureTogglesService.isActiveFeatureName(FeatureNames.COMPANY_INVITE_MEMBER) && (
        <div style={{ maxWidth: 328 }}>
          <LockedInviteAlert company={company} />
        </div>
      )}

      <div className="user-list-container small-y-margin">
        <AutoHeight
          disabled={disabled}
          minHeight="120px"
          maxHeight="120px"
          onChange={onChange}
          placeholder={Languages.t('components.add_mails_workspace.text_area_placeholder')}
        />
      </div>
      <div className="current-user-state small-text small-top-margin">
        {Languages.t('scenes.app.popup.adduserfromtdriveconsole.current_users_state', [
          emails.length || 0,
        ])}
      </div>
      <div className="current-user-state">
        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
          {Languages.t('scenes.app.popup.adduser.adresses_message')}
        </Typography.Text>
      </div>
      <div className="add-user-button-container">
        <Button
          type="primary"
          onClick={onClickBtn}
          disabled={disabled || props.loading}
          loading={loading || props.loading}
        >
          {emails.length === 0
            ? Languages.t('scenes.app.workspaces.components.skip')
            : Languages.t('general.add')}
        </Button>
      </div>
      {disabled === false && !props.noMagicLink && (
        <div className="magic-links-wrapper">
          <br />
          <MagicLinks />
        </div>
      )}
    </div>
  );
};
