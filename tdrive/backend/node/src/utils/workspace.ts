import { User, Workspace } from "./types";
import WorkspaceUser from "../services/workspaces/entities/workspace_user";
import { hasCompanyAdminLevel } from "./company";
import gr from "../services/global-resolver";

export async function isWorkspaceAdmin(user?: User, workspace?: Workspace): Promise<boolean> {
  if (!user || !workspace) {
    return false;
  }

  const companyUser = await gr.services.companies.getCompanyUser(
    { id: workspace.company_id },
    { id: user.id },
  );
  if (companyUser && hasCompanyAdminLevel(companyUser.role)) {
    return true;
  }

  const workspaceUser = await getWorkspaceUser(user, workspace);

  if (!workspaceUser) {
    return false;
  }

  return workspaceUser.role === "moderator";
}

export function hasWorkspaceAdminLevel(role: string, companyRole: string): boolean {
  return role === "moderator" || hasCompanyAdminLevel(companyRole);
}

export function hasWorkspaceMemberLevel(role: string, companyRole: string): boolean {
  return role === "member" || hasWorkspaceAdminLevel(role, companyRole);
}

export async function getWorkspaceUser(user?: User, workspace?: Workspace): Promise<WorkspaceUser> {
  if (!user || !workspace) {
    return null;
  }

  const workspaceUser = await gr.services.workspaces.getUser({
    workspaceId: workspace.workspace_id,
    userId: user.id,
  });

  return workspaceUser;
}

// export async function getCompanyUser(user?: User, company?: Company): Promise<CompanyUser> {
//   if (!user || !company) {
//     return null;
//   }
//
//   const companyUser = await gr.services.companies.getCompanyUser(
//     {
//       id: company.id,
//     },
//     {
//       id: user.id,
//     },
//   );
//
//   return companyUser;
// }
