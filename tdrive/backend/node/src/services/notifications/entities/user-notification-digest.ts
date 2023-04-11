import { Type } from "class-transformer";
import { merge } from "lodash";
import { Column, Entity } from "../../../core/platform/services/database/services/orm/decorators";

export const TYPE = "user_notification_digest";
/**
 * Table user-notification-digest
 */
@Entity(TYPE, {
  primaryKey: [["company_id"], "user_id"],
  type: TYPE,
})
export class UserNotificationDigest {
  /**
   * UUIDv4
   * Primary key / partition key
   */
  @Type(() => String)
  @Column("company_id", "uuid")
  company_id: string;

  /**
   * UUIDv4
   */
  @Type(() => String)
  @Column("user_id", "uuid")
  user_id: string;

  @Column("created_at", "number")
  created_at: number;

  @Column("deliver_at", "number")
  deliver_at: number;
}

export type UserNotificationDigestPrimaryKey = Pick<
  UserNotificationDigest,
  "user_id" | "company_id"
>;

export function getInstance(digest: UserNotificationDigest): UserNotificationDigest {
  return merge(new UserNotificationDigest(), digest);
}
