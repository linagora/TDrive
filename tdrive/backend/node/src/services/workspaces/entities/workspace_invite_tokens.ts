import { merge } from "lodash";
import { Column, Entity } from "../../../core/platform/services/database/services/orm/decorators";

export const TYPE = "workspace_invite_tokens";

@Entity(TYPE, {
  primaryKey: [["company_id"], "workspace_id", "user_id", "invite_token"],
  type: TYPE,
})
export default class WorkspaceInviteTokens {
  @Column("company_id", "uuid")
  company_id: string;

  @Column("workspace_id", "string")
  workspace_id: string;

  @Column("user_id", "string")
  user_id: string;

  @Column("invite_token", "string")
  invite_token: string;

  @Column("channels", "encoded_json")
  channels: null | string[];
}

export type WorkspaceInviteTokensPrimaryKey = Pick<
  WorkspaceInviteTokens,
  "company_id" | "workspace_id" | "user_id" | "invite_token"
>;

export function getInstance(
  workspaceInviteTokens: Partial<WorkspaceInviteTokens> & Partial<WorkspaceInviteTokensPrimaryKey>,
): WorkspaceInviteTokens {
  return merge(new WorkspaceInviteTokens(), workspaceInviteTokens);
}
