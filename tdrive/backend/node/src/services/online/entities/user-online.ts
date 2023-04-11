import { Type } from "class-transformer";
import { merge } from "lodash";
import { Column, Entity } from "../../../core/platform/services/database/services/orm/decorators";

export const TYPE = "user_online";

@Entity(TYPE, {
  primaryKey: ["user_id"],
  type: TYPE,
})
export default class UserOnline {
  @Type(() => String)
  @Column("user_id", "timeuuid", { generator: "timeuuid" })
  user_id: string;

  @Type(() => Boolean)
  @Column("is_connected", "boolean")
  is_connected: boolean;

  /**
   * Save the date the user has been seen connected
   */
  @Type(() => Number)
  @Column("last_seen", "number")
  last_seen: number;
}

export type UserOnlinePrimaryKey = { user_id: string };

export function getInstance(element: Partial<UserOnline>): UserOnline {
  return merge(new UserOnline(), element);
}
