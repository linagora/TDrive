import { CompanyType } from '@features/companies/types/company';
import { UserType } from '@features/users/types/user';
import { UserContext } from '@features/users/types/user-context';
import { WorkspaceType } from '@features/workspaces/types/workspace';

class UserContextState implements UserContext {
  private _user: UserType | undefined;
  private _company: CompanyType | undefined;
  private _workspace: WorkspaceType | undefined;

  set user(user: UserType | undefined) {
    user && (this._user = { ...user });
  }

  get user() {
    return this._user as UserType;
  }

  set company(company: CompanyType | undefined) {
    company && (this._company = { ...company });
  }

  get company() {
    return this.company as CompanyType;
  }

  set workspace(workspace: WorkspaceType | undefined) {
    workspace && (this._workspace = { ...workspace });
  }

  get workspace() {
    return this._workspace as WorkspaceType;
  }
}

export default new UserContextState();
