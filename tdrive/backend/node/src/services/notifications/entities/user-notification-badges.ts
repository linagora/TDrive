import { Type } from "class-transformer";
import { ChannelType } from "../../../utils/types";
import { Column, Entity } from "../../../core/platform/services/database/services/orm/decorators";
import { v4 as uuidv4 } from "uuid";
import { merge } from "lodash";

export const TYPE = "user_notification_badges";
/**
 * Table user-notification-badges
 */
@Entity(TYPE, {
  primaryKey: [["company_id"], "user_id", "workspace_id", "channel_id", "thread_id"],
  type: TYPE,
})
export class UserNotificationBadge {
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

  /**
   * Text
   * Primary key
   */
  @Type(() => String)
  @Column("workspace_id", "string")
  workspace_id: string | ChannelType.DIRECT;

  /**
   * UUIDv4
   * Primary key
   */
  @Type(() => String)
  @Column("channel_id", "uuid")
  channel_id: string;

  /**
   * UUIDv4
   * Primary key
   */
  @Type(() => String)
  @Column("thread_id", "string") //It can be null
  thread_id: string;

  @Type(() => String)
  @Column("message_id", "string") //It can be null
  message_id: string;

  /**
   * UUIDv4
   * Only used because crud entities must always have an id
   */
  @Type(() => String)
  @Column("id", "uuid")
  id: string = uuidv4();

  @Column("mention_type", "string")
  mention_type: "reply" | "global" | "me" | "unread" | null = "me";
}

export type UserNotificationBadgePrimaryKey = Pick<
  UserNotificationBadge,
  "user_id" | "company_id" | "workspace_id" | "channel_id" | "thread_id"
>;

export function getInstance(badge: UserNotificationBadge): UserNotificationBadge {
  return merge(new UserNotificationBadge(), badge);
}
