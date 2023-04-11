import { Type } from "class-transformer";
import { Column, Entity } from "../../../core/platform/services/database/services/orm/decorators";

@Entity("channel_member_read_cursors", {
  primaryKey: [["company_id"], "channel_id", "user_id"],
  type: "channel_member_read_cursors",
})
export class ChannelMemberReadCursors {
  /**
   * Primary key
   */
  @Type(() => String)
  @Column("company_id", "uuid", { generator: "uuid" })
  company_id: string;

  /**
   * Primary key
   */
  @Type(() => String)
  @Column("user_id", "uuid")
  user_id: string;

  /**
   * Primary key
   */
  @Type(() => String)
  @Column("channel_id", "uuid")
  channel_id: string;

  @Column("read_section", "encoded_json")
  read_section: ReadSection;
}

export type ReadSection = [string, string];
