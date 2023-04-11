import { UserCompanyType, UserType } from 'app/features/users/types/user';

export type WorkspaceType = {
  id: string;
  company_id: string;
  archived: boolean;
  default: boolean;
  name: string;
  mininame?: string;
  logo: string;
  role: string;
  stats: {
    created_at: Date;
    total_members: number;
  };
  preferences: WorkspaceInviteDomainType | null;
};

export type WorkspaceUserRole = 'moderator' | 'member';
export type WorkspaceUserType = UserType & {
  role: WorkspaceUserRole;
  user_id: string;
  workspace_id: string;
  user: UserType;
  companies?: UserCompanyType[];
};

export type WorkspacePendingUserType = {
  company_role: 'member' | 'guest' | 'admin';
  role: 'member' | 'moderator';
  email: string;
};

export type WorkspaceInviteDomainType = {
  invite_domain: string | null;
}
