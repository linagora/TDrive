import { PaginationQueryParameters, uuid } from "../../../utils/types";
import { WorkspaceUserRole } from "../types";
import {
  CompanyPlanObject,
  CompanyStatsObject,
  CompanyUserRole,
  UserObject,
} from "../../user/web/types";
import Company from "../../user/entities/company";
export interface WorkspaceRequest extends WorkspaceBaseRequest {
  id: uuid;
}

export interface WorkspaceBaseRequest {
  company_id: uuid;
}

export interface WorkspaceUsersBaseRequest extends WorkspaceBaseRequest {
  workspace_id: uuid;
}

export interface WorkspacesListRequest extends WorkspaceBaseRequest, PaginationQueryParameters {}

export interface WorkspaceUsersRequest extends WorkspaceUsersBaseRequest {
  user_id: uuid;
}

export interface WorkspacePendingUserRequest extends WorkspaceUsersBaseRequest {
  email: string;
}

export interface WorkspaceUsersAddBody {
  resource: {
    user_id: uuid;
    role: WorkspaceUserRole;
  };
}

export interface WorkspaceUsersInvitationItem {
  email: string;
  role: WorkspaceUserRole;
  company_role: CompanyUserRole;
  password?: string;
}

export interface WorkspaceUsersInvitationRequestBody {
  invitations: WorkspaceUsersInvitationItem[];
  channels?: string[];
}

export interface WorkspaceUserInvitationResponseItem {
  email: string;
  status: "ok" | "error";
  message?: string;
}

export interface WorkspaceUserInvitationResponse {
  resources: WorkspaceUserInvitationResponseItem[];
}

export type WorkspaceCreateResource = Pick<WorkspaceObject, "name" | "logo" | "default">;
export type WorkspaceUpdateResource = Pick<
  WorkspaceObject,
  "name" | "logo" | "default" | "archived"
>;

export interface CreateWorkspaceBody {
  resource: WorkspaceCreateResource;
  options?: { logo_b64?: string };
}

export interface UpdateWorkspaceBody {
  resource: WorkspaceUpdateResource;
  options?: { logo_b64?: string };
}

export interface WorkspaceObject {
  id: string;
  company_id: string;
  name: string;
  logo: string;

  default: boolean;
  archived: boolean;

  stats: {
    created_at: number;
    total_members: number;
  };

  role?: WorkspaceUserRole;

  preferences: null | {
    invite_domain?: string;
  };
}

export interface WorkspaceUserObject {
  id: string;
  company_id: string;
  workspace_id: string;
  user_id: string;
  created_at: number; //Timestamp in ms
  role: WorkspaceUserRole;
  user: UserObject;
}

export interface WorkspaceInviteTokenGetRequest extends WorkspaceBaseRequest {
  workspace_id: uuid;
}

export interface WorkspaceInviteTokenBody {
  channels: string[];
}

export interface WorkspaceInviteTokenDeleteRequest extends WorkspaceBaseRequest {
  workspace_id: uuid;
  token: string;
}

export interface WorkspaceInviteTokenObject {
  token: string;
}

export interface InviteTokenObject {
  c: string;
  w: string;
  u: string;
  t: string;
}

export interface WorkspaceJoinByTokenRequest extends WorkspaceBaseRequest {
  join: boolean;
  token: string;
}

export interface WorkspaceJoinByTokenResponse {
  company: {
    id?: Company["id"];
    name: Company["name"];
    stats?: CompanyStatsObject;
    plan?: CompanyPlanObject;
  };
  workspace: {
    id?: string;
    name: string;
  };
  auth_required: boolean;
}

export interface WorkspaceInviteDomainBody {
  domain: string;
}
