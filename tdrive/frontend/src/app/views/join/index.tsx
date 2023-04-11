import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { Button, Col, Divider, Layout, Row, Space, Typography } from 'antd';

import {
  MagicLinksJoinResponse,
  MagicLinksJoinService,
} from 'app/features/workspaces/services/magic-links-service';
import Languages from 'app/features/global/services/languages-service';
import RouterService from 'app/features/router/services/router-service';
import InitService from 'app/features/global/services/init-service';
import LockedInviteAlert from 'app/components/locked-features-components/locked-invite-alert';
import FeatureTogglesService, {
  FeatureNames,
} from 'app/features/global/services/feature-toggles-service';

import './styles.scss';
import LocalStorage from 'app/features/global/framework/local-storage-service';

const { Title, Text } = Typography;

type JoinError = {
  title: string;
  description: string;
};

export default (): JSX.Element => {
  const [error, setError] = useState<JoinError>();
  const [info, setInfo] = useState<MagicLinksJoinResponse>();
  const [busy, setBusy] = useState<boolean>(false);
  const [, setCookie] = useCookies(['pending-redirect']);

  if (info?.company?.plan) FeatureTogglesService.setFeaturesFromCompanyPlan(info?.company?.plan);

  const params = useParams() as Record<string, string>;
  const service = new MagicLinksJoinService(params.token, (val: boolean) => setBusy(val));

  useEffect(() => {
    service
      .getInfo()
      .then(info => {
        setInfo(info);
      })
      .catch(() =>
        setError({
          title: Languages.t('scenes.join.wrong_link_title'),
          description: Languages.t('scenes.join.wrong_link_description'),
        }),
      );
  }, [service]);

  if (info?.auth_required) {
    //Save requested URL for after redirect / sign-in
    //Fixme this is code duplication from auth service
    LocalStorage.setItem('requested_url', {
      url: document.location.href,
      time: new Date().getTime(),
    });
  }

  const onJoinAccountBtnClick = () => {
    if (!info) return null;

    if (info.auth_required) {
      const origin = document.location.origin;
      const currentPage = document.location.href;

      const authUrl = `${
        InitService.server_infos?.configuration?.accounts?.remote?.authority
      }/oauth2/authorize?invite=1&redirect_uri=${encodeURIComponent(origin)}`;
      setCookie('pending-redirect', currentPage, { path: '/', maxAge: 60 * 60 });
      setBusy(true);
      document.location.href = authUrl;
    } else {
      service
        .join()
        .then(resource => {
          setBusy(true);
          document.location.replace(
            RouterService.generateRouteFromState({
              workspaceId: resource.workspace.id,
              companyId: resource.company.id,
            }),
          );
        })
        .catch(err => {
          console.log(err);
          setError(err.message);
        });
    }
  };

  const onCreateCompanyBtnClick = () => {
    if (InitService.server_infos?.configuration?.accounts?.type === 'remote') {
      return document.location.replace(InitService.getConsoleLink('account_management_url'));
    } else {
      document.location.replace('/');
    }
  };

  const lockedInvitation =
    info?.company && !FeatureTogglesService.isActiveFeatureName(FeatureNames.COMPANY_INVITE_MEMBER);

  return (
    <Layout className="joinPage">
      <Layout.Content>
        <Row justify="center" align="middle" style={{ height: '100%' }}>
          <Col>
            {!error && !info && <Text>{Languages.t('scenes.join.loading')}</Text>}

            {error && (
              <Space direction="vertical" align="center">
                <Title>
                  {error.title || 'An error occured'}{' '}
                  <span role="img" aria-label="">
                    ✋
                  </span>
                </Title>
                <Text>{error.description || 'An unknown error occured, please try again.'}</Text>
                <Divider />
                <Button
                  disabled={busy}
                  loading={busy}
                  type="primary"
                  onClick={onCreateCompanyBtnClick}
                >
                  {Languages.t('scenes.join.create_the_company_button')}
                </Button>
              </Space>
            )}

            {!error && info && (
              <Space direction="vertical" align="center">
                <Title>
                  {Languages.t('scenes.join.join_workspace_from_company', [
                    info.company.name,
                    info.workspace.name,
                  ])}{' '}
                  <span role="img" aria-label="">
                    👋
                  </span>
                </Title>
                <Text>{Languages.t('scenes.join.tdrive_description')}</Text>
                <Divider />

                {lockedInvitation && (
                  <div style={{ maxWidth: 400 }}>
                    <LockedInviteAlert company={info?.company} magicLink />
                  </div>
                )}

                {!lockedInvitation && (
                  <>
                    {info.auth_required ? (
                      <Button
                        disabled={
                          busy ||
                          !FeatureTogglesService.isActiveFeatureName(
                            FeatureNames.COMPANY_INVITE_MEMBER,
                          )
                        }
                        loading={busy}
                        type="primary"
                        onClick={onJoinAccountBtnClick}
                      >
                        {Languages.t('scenes.join.login_first_button')}
                      </Button>
                    ) : (
                      <Button
                        disabled={busy}
                        loading={busy}
                        type="primary"
                        onClick={onJoinAccountBtnClick}
                      >
                        {Languages.t('scenes.join.join_the_team_button')}
                      </Button>
                    )}
                  </>
                )}
              </Space>
            )}
          </Col>
        </Row>
      </Layout.Content>
    </Layout>
  );
};
