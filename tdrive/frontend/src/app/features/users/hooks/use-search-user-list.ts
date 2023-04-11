/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';

import useRouterCompany from 'app/features/router/hooks/use-router-company';
import { UserType } from 'app/features/users/types/user';
import { getCurrentUserList, setUserList, useSetUserList, useUserList } from './use-user-list';
import UserAPIClient, { SearchContextType } from '../api/user-api-client';
import { delayRequest } from 'app/features/global/utils/managedSearchRequest';
import { distanceFromQuery, matchQuery } from 'app/features/global/utils/strings';
import useRouterWorkspace from 'app/features/router/hooks/use-router-workspace';
import _ from 'lodash';

export const searchBackend = async (
  query: string | undefined,
  {
    workspaceId,
    companyId,
    scope,
    callback,
  }: {
    workspaceId: string;
    companyId: string;
    scope: SearchContextType['scope'];
    callback?: () => void;
  },
) => {
  delayRequest('useSearchUsers', async () => {
    await UserAPIClient.search<any>(
      query,
      {
        companyId,
        workspaceId: scope === 'workspace' ? workspaceId : undefined,
        scope,
      },
      result => {
        let final: UserType[] = [];
        if (result && scope === 'workspace') {
          final = result.map(wsUser => ({
            ...wsUser.user,
            workspaces: [{ id: workspaceId, company_id: companyId, role: wsUser.role }],
          }));
        }

        if (result && scope === 'company') {
          final = result.map(user => ({
            ...user,
            workspaces: [{ id: workspaceId, company_id: companyId }],
          }));
        }

        callback && callback();
        setUserList && setUserList(final);
      },
    );
  });
};

export const searchFrontend = (
  query: string | undefined,
  {
    workspaceId,
    companyId,
    scope,
    userList,
  }: {
    workspaceId: string;
    companyId: string;
    scope: SearchContextType['scope'];
    userList?: UserType[];
  },
) => {
  let result = userList || getCurrentUserList() || [];

  if (query) {
    result = _.sortBy(
      result.filter(({ email, first_name, last_name, username }) =>
        matchQuery(query, `${email} ${first_name} ${last_name} ${username}`),
      ),
      a =>
        distanceFromQuery([a.last_name, a.first_name, a.email, a.username].join(' '), query, {
          booster: [10, 10, 2, 1],
        }),
    );
  }

  if (!query) {
    // TODO return list with users sorted by favorite
  }

  if (scope === 'company') {
    result = result?.filter(u => u.companies?.map(obj => obj.company.id).includes(companyId));
  }

  if (scope === 'workspace') {
    result = result.filter(u => u.workspaces?.map(ws => ws.id).includes(workspaceId));
  }

  return result;
};

export const useSearchUsers = ({
  scope,
}: {
  scope: SearchContextType['scope'];
}): {
  search: (str?: string) => UserType[];
  query: string | undefined;
  result: UserType[];
} => {
  const { set: setUserList } = useSetUserList('use-search-user-list');
  const [query, setQuery] = useState<string | undefined>();
  let { userList } = useUserList();
  userList = _.uniqBy(userList, 'id');

  const companyId = useRouterCompany();
  const workspaceId = useRouterWorkspace();
  const search = (str?: string) => {
    setQuery(str);
    return searchFrontend(str, { workspaceId, scope, companyId, userList: userList || [] });
  };

  useEffect(() => {
    searchBackend(query, { workspaceId, scope, companyId });
  }, [companyId, query, scope, setUserList, workspaceId]);

  const result = searchFrontend(query, { workspaceId, scope, companyId, userList: userList || [] });

  return { search, query, result };
};
