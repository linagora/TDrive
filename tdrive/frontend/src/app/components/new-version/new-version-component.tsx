import React, { useMemo, useState } from 'react';
import { Col, Row, Typography } from 'antd';

import Api from 'app/features/global/framework/api-service';
import Banner from 'app/components/banner/banner';
import Emojione from 'app/components/emojione/emojione';
import Languages from 'app/features/global/services/languages-service';
import Globals from 'app/features/global/services/globals-tdrive-app-service';
import ModalManager from 'app/components/modal/modal-manager';
import NewVersionModal from './new-version-modal';
import { ServerInfoType } from 'app/features/global/services/init-service';

let lastScrape = 0;

const NewVersionComponent = (): JSX.Element => {
  const [displayBanner, setDisplayBanner] = useState<boolean>(false);

  const compareVersion: (v1: string, v2: string) => number = (v1: string, v2: string) => {
    const toNumber: (v: string) => number = (v: string) => {
      const a = v.split('.').map((s: string) => parseInt(s.replace(/[^0-9]/g, '')));
      return 1000000 * (1000 * a[0] + a[1]) + a[2];
    };
    return toNumber(v1) - toNumber(v2);
  };

  useMemo(() => {
    const getConfiguration = async () => {
      if (new Date().getTime() - lastScrape < 15 * 60 * 1000) {
        return;
      }
      lastScrape = new Date().getTime();

      const config = await Api.get<ServerInfoType>(
        '/internal/services/general/v1/server',
        undefined,
        false,
        {
          disableJWTAuthentication: true,
        },
      );
      const currentVersion: string = Globals.version.version_detail;
      const newestVersion: string = config?.version?.current || '';
      const minimalWebVersion: string = config?.version?.minimal?.web || '';

      const shouldDisplayModal: boolean =
        minimalWebVersion && compareVersion(minimalWebVersion, currentVersion) > 0 ? true : false;
      const shouldDisplayBanner: boolean =
        newestVersion && compareVersion(newestVersion, currentVersion) > 0 && !shouldDisplayModal
          ? true
          : false;

      if (shouldDisplayModal) {
        return ModalManager.open(
          <NewVersionModal />,
          {
            position: 'center',
            size: { width: '600px' },
          },
          false,
        );
      }

      if (shouldDisplayBanner) {
        return setDisplayBanner(shouldDisplayBanner);
      }
    };

    document.addEventListener('visibilitychange', () => {
      getConfiguration();
    });
    window.addEventListener('focus', () => {
      getConfiguration();
    });
    getConfiguration();
  }, []);

  return (
    <>
      {displayBanner && (
        <Banner
          height={32}
          type="primary"
          content={
            <Row align="middle" gutter={[8, 0]}>
              <Col>
                <b>{Languages.t('components.newversion.new_version_component.row.part_1')}</b>,{' '}
                {Languages.t('components.newversion.new_version_component.row.part_2')}{' '}
                <Emojione type="rocket" />
              </Col>
              <Col>
                <Typography.Link
                  style={{ color: 'var(--white)' }}
                  underline
                  onClick={() => window.location.reload()}
                >
                  {Languages.t('components.newversion.new_version_component.link')}
                </Typography.Link>
              </Col>
            </Row>
          }
          closable
          onClose={() => setDisplayBanner(false)}
        />
      )}
    </>
  );
};
export default NewVersionComponent;
