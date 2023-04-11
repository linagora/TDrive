import { useEffect } from 'react';
import { cloneDeep, isEqual, uniqBy } from 'lodash';
import { useRecoilCallback, useRecoilValueLoadable } from 'recoil';

import useRouterCompany from 'app/features/router/hooks/use-router-company';
import useRouterWorkspace from 'app/features/router/hooks/use-router-workspace';
import { UserCompanyType, UserType, UserWorkspaceType } from 'app/features/users/types/user';
import WorkspaceUserAPIClient from 'app/features/workspace-members/api/workspace-members-api-client';
import { UserListState } from '../state/atoms/user-list';
import Collections from 'app/deprecated/CollectionsV1/Collections/Collections';
import _ from 'lodash';

export const usePreloadSomeUsers = () => {
  const companyId = useRouterCompany();
  const workspaceId = useRouterWorkspace();
  const { set: setUserList } = useSetUserList('useUserList');

  const preloadSomeUsers = async () => {
    const updatedData = (await WorkspaceUserAPIClient.list(companyId, workspaceId)).map(
      wsUser => wsUser.user,
    );

    if (updatedData) setUserList(updatedData);
  };

  useEffect(() => {
    if (companyId.length && workspaceId.length) preloadSomeUsers();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, workspaceId]);
};

export const useUserList = (): {
  userList?: UserType[];
} => {
  const userList = useRecoilValueLoadable(UserListState).valueMaybe();
  return { userList };
};

// Access from any services
// You can't use it before calling the useSetUserList hook
export let setUserList: (nextList: UserType[]) => void = () => undefined;

let currentUserList: UserType[] = [];

export const getCurrentUserList = () => currentUserList;

export const getUser = (userId: string) => {
  return currentUserList.filter(u => u.id === userId)[0];
};

const completeUserWithCompanies = (user: UserType, companies?: UserCompanyType[]): UserType => {
  return {
    ...user,
    companies: companies !== undefined ? companies : user.companies || [],
  };
};

const completeUserWithWorkspaces = (
  user: UserType,
  previousWorkspaces?: UserWorkspaceType[],
): UserType => ({
  ...user,
  workspaces:
    uniqBy([...(user.workspaces || []), ...(previousWorkspaces || [])], ws => ws.id) || [],
});

// Access from hooks-components
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useSetUserList(key: string) {
  const set = useRecoilCallback(({ set }) => (nextList: UserType[]) => {
    const currentList = currentUserList;

    if (nextList && nextList.length) {
      const nextListMerged = nextList.map(u =>
        cloneDeep(
          _.merge(
            {},
            currentList.find(cu => cu.id === u.id) || {},
            u,
          ),
        ),
      );

      const newList = _.uniqBy([...nextListMerged, ...currentList], 'id')
        .map(u => completeUserWithCompanies(u, nextList.find(obj => obj.id === u.id)?.companies))
        .map(u => completeUserWithWorkspaces(u, nextList.find(obj => obj.id === u.id)?.workspaces));

      newList.sort();

      if (currentList && newList && !isEqual(currentList, newList)) {
        set(UserListState, newList);
        newList.forEach(user => Collections.get('users').completeObject(_.cloneDeep(user)));
        currentUserList = newList;
      }
    }
  });

  setUserList = set;

  return { set };
}
