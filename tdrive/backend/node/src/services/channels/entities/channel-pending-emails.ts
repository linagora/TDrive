import { Type } from "class-transformer";
import { merge } from "lodash";
import { Column, Entity } from "../../../core/platform/services/database/services/orm/decorators";

@Entity("channel_pending_emails", {
  primaryKey: [["company_id", "workspace_id"], "channel_id", "email"],
  type: "channel_pending_emails",
})
export class ChannelPendingEmails {
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
  @Column("workspace_id", "uuid")
  workspace_id: string;

  /**
   * Primary key
   */
  @Type(() => String)
  @Column("channel_id", "uuid")
  channel_id: string;

  /**
   * Pending email
   */
  @Type(() => String)
  @Column("email", "string")
  email: string;
}

export type ChannelPendingEmailsPrimaryKey = Pick<
  ChannelPendingEmails,
  "channel_id" | "company_id" | "workspace_id" | "email"
>;

export function getInstance(pendingEmail: ChannelPendingEmails): ChannelPendingEmails {
  return merge(new ChannelPendingEmails(), pendingEmail);
}
