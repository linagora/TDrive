import { merge } from "lodash";
import { Column, Entity } from "../../../core/platform/services/database/services/orm/decorators";
import { WorkspaceUserRole } from "../types";
import { CompanyUserRole } from "../../user/web/types";

export const TYPE = "workspace_pending_users";

/**
 * A list of users awaiting invitation
 */
@Entity(TYPE, {
  primaryKey: [["workspace_id"], "email"],
  type: TYPE,
})
export default class WorkspacePendingUser {
  @Column("workspace_id", "uuid")
  workspace_id: string;

  @Column("email", "string")
  email: string;

  @Column("role", "string")
  role: WorkspaceUserRole;

  @Column("company_role", "string")
  company_role: CompanyUserRole;
}

export type WorkspacePendingUserPrimaryKey = Partial<
  Pick<WorkspacePendingUser, "workspace_id" | "email">
>;

export function getInstance(
  workspaceUser: Partial<WorkspacePendingUserPrimaryKey> & WorkspacePendingUserPrimaryKey,
): WorkspacePendingUser {
  return merge(new WorkspacePendingUser(), workspaceUser);
}
