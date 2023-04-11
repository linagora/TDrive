import { ExecutionContext } from "../../core/platform/framework/api/crud-service";

export interface WorkspaceExecutionContext extends ExecutionContext {
  company_id: string;
}

export interface WorkspaceUsersExecutionContext extends ExecutionContext {
  company_id: string;
  workspace_id: string;
}

export interface WorkspaceInviteTokensExecutionContext extends ExecutionContext {
  company_id: string;
  workspace_id: string;
}

export type WorkspaceUserRole = "moderator" | "member";
