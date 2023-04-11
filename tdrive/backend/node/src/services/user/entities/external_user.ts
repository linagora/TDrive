import { merge } from "lodash";
import { Column, Entity } from "../../../core/platform/services/database/services/orm/decorators";

export const TYPE = "external_user_repository";

@Entity(TYPE, {
  primaryKey: [["service_id"], "external_id", "user_id"],
  type: TYPE,
})
export default class ExternalUser {
  @Column("service_id", "string")
  service_id: string;

  @Column("external_id", "string")
  external_id: string;

  @Column("user_id", "timeuuid")
  user_id: string;
}

export type ExternalUserPrimaryKey = Pick<ExternalUser, "service_id">;

export function getInstance(user: Partial<ExternalUser> & ExternalUserPrimaryKey): ExternalUser {
  return merge(new ExternalUser(), user);
}
