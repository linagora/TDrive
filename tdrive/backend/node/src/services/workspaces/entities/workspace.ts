import { merge } from "lodash";
import { Column, Entity } from "../../../core/platform/services/database/services/orm/decorators";

export const TYPE = "workspaces";

@Entity(TYPE, {
  primaryKey: [["company_id"], "id"],
  type: TYPE,
})
export default class Workspace {
  @Column("id", "timeuuid")
  id: string;

  @Column("company_id", "timeuuid")
  company_id: string;

  @Column("name", "encoded_string")
  name: string;

  @Column("logo", "encoded_string")
  logo: string;

  @Column("stats", "encoded_string")
  stats: string;

  @Column("is_deleted", "boolean")
  isDeleted: boolean;

  @Column("is_archived", "boolean")
  isArchived: boolean;

  @Column("is_default", "boolean")
  isDefault: boolean;

  @Column("date_added", "number")
  dateAdded: number;

  @Column("preferences", "encoded_json")
  preferences: null | {
    invite_domain?: string;
  };
}

export type WorkspacePrimaryKey = Pick<Workspace, "company_id" | "id">;

export function getInstance(
  workspace: Partial<Workspace> & Partial<WorkspacePrimaryKey>,
): Workspace {
  return merge(new Workspace(), workspace);
}
