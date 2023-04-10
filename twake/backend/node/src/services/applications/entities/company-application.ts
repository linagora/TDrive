import { Type } from "class-transformer";
import { Column, Entity } from "../../../core/platform/services/database/services/orm/decorators";
import { PublicApplicationObject } from "./application";

export const TYPE = "group_app";

@Entity(TYPE, {
  primaryKey: [["group_id"], "app_id", "id"],
  type: TYPE,
})
export default class CompanyApplication {
  @Type(() => String)
  @Column("group_id", "timeuuid")
  company_id: string;

  @Type(() => String)
  @Column("app_id", "timeuuid")
  application_id: string;

  @Type(() => String)
  @Column("id", "timeuuid", { generator: "timeuuid" })
  id: string;

  @Column("created_at", "number")
  created_at: number;

  @Type(() => String)
  @Column("created_by", "string")
  created_by: string; //Will be the default delegated user when doing actions on Twake
}

export type CompanyApplicationPrimaryKey = Pick<
  CompanyApplication,
  "company_id" | "application_id" | "id"
>;

export class CompanyApplicationWithApplication extends CompanyApplication {
  //Not in database but attached to this object
  application?: PublicApplicationObject;
}
