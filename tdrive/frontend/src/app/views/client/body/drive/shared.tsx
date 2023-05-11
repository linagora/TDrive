import { useEffect, useState } from 'react';

import MenusBodyLayer from '@components/menus/menus-body-layer';
import Api from '@features/global/framework/api-service';
import Languages from '@features/global/services/languages-service';
import { addApiUrlIfNeeded } from '@features/global/utils/URLUtils';
import RouterService from '@features/router/services/router-service';
import Drive from '@views/client/body/drive';
import { useParams } from 'react-router-dom';
import shortUUID from 'short-uuid';
import Avatar from '../../../../atoms/avatar';
import { setPublicLinkToken } from '../../../../features/drive/api-client/api-client';
import useRouterCompany from '../../../../features/router/hooks/use-router-company';

export default () => {
  const companyId = useRouterCompany();

  const [state, setState] = useState({ group: { logo: '', name: '' } });
  useEffect(() => {
    const routeState = RouterService.getStateFromRoute();
    Api.get('/internal/services/users/v1/companies/' + routeState.companyId, (res: any) => {
      if (res && res.resource) {
        setState({
          ...state,
          group: {
            name: res.resource.name,
            logo: addApiUrlIfNeeded(res.resource.logo),
          },
        });
      }
    });
  }, []);

  const group = state.group;

  const { token, documentId: _documentId } = useParams() as { token?: string; documentId?: string };
  const documentId = _documentId ? shortUUID().toUUID(_documentId || '') : '';
  setPublicLinkToken(token || null);

  if (!companyId) {
    return <></>;
  }

  return (
    <div className="flex flex-col h-full w-full dark:bg-zinc-900">
      <div className="flex flex-row items-center justify-center bg-blue-500 px-4 py-2">
        <div className="grow flex flex-row items-center">
          {group.logo && (
            <Avatar avatar={group.logo} className="inline-block mr-3" size="sm" type="square" />
          )}
          <span className="text-white font-semibold" style={{ lineHeight: '32px' }}>
            {group.name}
          </span>
        </div>
        <div className="shrink-0">
          <a href="https://tdrive.app" target="_BLANK" rel="noreferrer" className="!text-white">
            <span className="nomobile text-white">
              {Languages.t('scenes.app.mainview.create_account')}
            </span>
            Tdrive Workplace &nbsp; 👉
          </a>
        </div>
      </div>
      <div className="main-view public p-4">
        <Drive initialParentId={documentId} inPublicSharing />
      </div>
      <MenusBodyLayer />
    </div>
  );
};
