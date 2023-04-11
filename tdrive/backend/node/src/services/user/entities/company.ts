import { merge } from "lodash";
import { Column, Entity } from "../../../core/platform/services/database/services/orm/decorators";
import { CompanyFeaturesObject, CompanyLimitsObject } from "../web/types";

// backward compatibility with PHP where companies used to be `group_entity`
export const TYPE = "group_entity";

@Entity(TYPE, {
  primaryKey: [["id"]],
  type: TYPE,
})
export default class Company {
  @Column("id", "timeuuid")
  id: string;

  @Column("name", "encoded_string")
  name: string;

  @Column("display_name", "encoded_string")
  displayName: string;

  @Column("plan", "encoded_json")
  plan?: {
    name: string;
    limits: CompanyLimitsObject;
    features: CompanyFeaturesObject;
  };

  @Column("stats", "encoded_json")
  stats: any;

  @Column("logo_id", "timeuuid")
  logofile: string;

  @Column("logo", "encoded_string")
  logo: string;

  @Column("date_added", "number")
  dateAdded: number;

  @Column("on_creation_data", "encoded_json")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onCreationData: any;

  @Column("member_count", "number")
  memberCount: number;

  @Column("identity_provider", "encoded_string")
  identity_provider: string;

  @Column("identity_provider_id", "encoded_string")
  identity_provider_id: string;
}

export type CompanyPrimaryKey = Pick<Company, "id">;
export type CompanySearchKey = Partial<
  Pick<Company, "id" | "identity_provider_id" | "identity_provider">
>;

export function getInstance(company: Partial<Company>): Company {
  return merge(new Company(), company);
}
