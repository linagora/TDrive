import { merge } from "lodash";
import { Column, Entity } from "../../../core/platform/services/database/services/orm/decorators";

export const TYPE = "external_group_repository";

@Entity(TYPE, {
  primaryKey: [["service_id"], "external_id", "company_id"],
  type: TYPE,
})
export default class ExternalGroup {
  @Column("service_id", "string")
  service_id: string;

  @Column("external_id", "string")
  external_id: string;

  @Column("company_id", "string")
  company_id: string;
}

export type ExternalGroupPrimaryKey = Pick<ExternalGroup, "service_id" | "external_id">;

export function getInstance(
  group: Partial<ExternalGroup> & ExternalGroupPrimaryKey,
): ExternalGroup {
  return merge(new ExternalGroup(), group);
}
