import { CompaniesState } from '../state/companies';
import useRouterCompany from '../../router/hooks/use-router-company';
import { useRecoilState } from 'recoil';
import { CurrentUserState } from '../../users/state/atoms/current-user';
import { CompanyType } from 'app/features/companies/types/company';
import LocalStorage from 'app/features/global/framework/local-storage-service';
import { UserType } from 'app/features/users/types/user';
import { useCurrentUser } from '../../users/hooks/use-current-user';
import _ from 'lodash';
import RouterService from 'app/features/router/services/router-service';
import WorkspacesService from 'app/deprecated/workspaces/workspaces.jsx';
import AccessRightsService from 'app/features/workspace-members/services/workspace-members-access-rights-service';
import Groups from 'app/deprecated/workspaces/groups.js';
import LoginService from 'app/features/auth/login-service';
import UserAPIClient from 'app/features/users/api/user-api-client';
import { useRealtimeRoom } from 'app/features/global/hooks/use-realtime';
import CompanyAPIClient from 'app/features/companies/api/company-api-client';

/**
 * Will return the companies of the current user
 */
export const useCompanies = () => {
  const [user] = useRecoilState(CurrentUserState);

  const refresh = async () => {
    await LoginService.updateUser();
  };

  return { companies: user?.companies || [], refresh };
};

/**
 * Will return the requested company
 */
export const useCompany = (companyId: string) => {
  const [company, setCompany] = useRecoilState(CompaniesState(companyId));

  const refresh = async () => {
    if (companyId) setCompany(await UserAPIClient.getCompany(companyId));
  };

  return { company: company as CompanyType, refresh };
};

/**
 * Will return the currently visible company and select one if nothing is already selected
 */
export const useCurrentCompany = () => {
  const user = useCurrentUser().user;
  const bestCandidate = useBestCandidateCompany(user)?.id || '';

  //Get current route company and verify it is available to the user
  let routerCompanyId = useRouterCompany();
  if (!user?.companies?.find(c => c.company.id === routerCompanyId)) routerCompanyId = '';

  //If there is no company for this user, display the no company page
  if (user?.companies?.length === 0) {
    WorkspacesService.openNoCompaniesPage();
  }

  //If there is nothing in router or company in router isn't available for the user, try to use the best candidate available
  if (!routerCompanyId && bestCandidate) {
    RouterService.push(RouterService.generateRouteFromState({ companyId: bestCandidate }));
  }

  const [company, setCompany] = useRecoilState(CompaniesState(routerCompanyId));

  const refresh = async () => {
    if (company) setCompany(await CompanyAPIClient.get(company.id));
  };

  //Always set the current company in localstorage to open it automatically later
  if (routerCompanyId && company) {
    //Depreciated retrocompatibility
    Groups.addToUser(company);
    AccessRightsService.updateCompanyLevel(
      company.id,
      company.role === 'admin' || company.role === 'owner'
        ? 'admin'
        : company.role === 'member'
        ? 'member'
        : 'guest',
    );
    //End of depreciated

    LocalStorage.setItem('default_company_id', routerCompanyId);
  }

  return { company: company as CompanyType, refresh };
};

export const useCurrentCompanyRealtime = () => {
  const { company, refresh } = useCurrentCompany();

  const room = CompanyAPIClient.websocket(company?.id || '');
  useRealtimeRoom<CompanyType>(room, 'useCurrentCompany', () => {
    refresh();
  });
};

/**
 * Company priority:
 * 1. Router company id
 * 2. Local storage company id
 * 3. User's preferences
 * 4. User's company with the most total members
 *
 * @param user
 * @returns CompanyType | undefined
 */
export function useBestCandidateCompany(user: UserType | undefined): CompanyType | undefined {
  const routerCompanyId = useRouterCompany();
  const storageCompanyId = (LocalStorage.getItem('default_company_id') as string) || null;

  const recentWorkspaceObj =
    user?.preferences && user?.preferences?.recent_workspaces
      ? user.preferences.recent_workspaces[0]
      : undefined;

  if (!user) {
    return undefined;
  }

  const companies = _.cloneDeep(user.companies || []);

  return (
    companies.find(o => o.company.id === routerCompanyId)?.company ||
    companies.find(o => o.company.id === storageCompanyId)?.company ||
    companies.find(o => o.company.id === recentWorkspaceObj?.company_id)?.company ||
    companies.sort(
      (a, b) => (a.company?.stats?.total_members || 0) - (b.company?.stats?.total_members || 0),
    )?.[0]?.company
  );
}
