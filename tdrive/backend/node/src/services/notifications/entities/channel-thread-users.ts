import { Type } from "class-transformer";
import { merge } from "lodash";
import { Column, Entity } from "../../../core/platform/services/database/services/orm/decorators";

export const TYPE = "channel_thread_users";
@Entity(TYPE, {
  primaryKey: [["company_id", "channel_id", "thread_id"], "user_id"],
  type: TYPE,
})
export class ChannelThreadUsers {
  /**
   * UUIDv4
   * Primary key / partition key
   */
  @Type(() => String)
  @Column("company_id", "uuid")
  company_id: string;

  /**
   * UUIDv4
   * Primary key / partition key
   */
  @Type(() => String)
  @Column("channel_id", "uuid")
  channel_id: string;

  /**
   * UUIDv4
   * Primary key / partition key
   */
  @Type(() => String)
  @Column("thread_id", "uuid")
  thread_id: string;

  /**
   * UUIDv4
   */
  @Type(() => String)
  @Column("user_id", "uuid")
  user_id: string;
}

export type ChannelThreadUsersPrimaryKey = Pick<
  ChannelThreadUsers,
  "company_id" | "channel_id" | "thread_id"
>;

export function getInstance(element: ChannelThreadUsers): ChannelThreadUsers {
  return merge(new ChannelThreadUsers(), element);
}
