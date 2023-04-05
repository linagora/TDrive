import { Type } from "class-transformer";
import { Column, Entity } from "../../../core/platform/services/database/services/orm/decorators";

export const TYPE = "drive_tdrive_tab";

@Entity(TYPE, {
  primaryKey: [["company_id"], "tab_id"],
  type: TYPE,
})
export class DriveTdriveTab {
  @Type(() => String)
  @Column("company_id", "string")
  company_id: string;

  @Type(() => String)
  @Column("tab_id", "string")
  tab_id: string;

  @Type(() => String)
  @Column("channel__id", "string")
  channel_id: string;

  @Type(() => String)
  @Column("item_id", "string")
  item_id: string;

  @Type(() => String)
  @Column("level", "string")
  level: "read" | "write";
}
