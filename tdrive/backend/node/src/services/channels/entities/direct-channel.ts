import { Type } from "class-transformer";
import { merge } from "lodash";
import { Column, Entity } from "../../../core/platform/services/database/services/orm/decorators";

/**
 * Direct Channel information.
 * A direct channel is a channel in a company composed of a defined set of users.
 */
@Entity("direct_channels", {
  primaryKey: [["company_id"], "users", "channel_id"],
  type: "direct_channels",
})
export class DirectChannel {
  /**
   * The company identifier of this channel
   * uuid-v4
   */
  @Type(() => String)
  @Column("company_id", "uuid", { generator: "uuid" })
  company_id: string;

  /**
   * The link to Channel.id
   * uuid-v4
   */
  @Type(() => String)
  @Column("channel_id", "string")
  channel_id: string;

  /**
   * CSV list of ordered user ids
   */
  @Column("users", "string")
  users: string;

  static getUsersAsString(users: string[] = []): string {
    return users.sort().join(",");
  }

  static getUsersFromString(identifier: string = ""): string[] {
    return identifier.split(",");
  }
}

export function getInstance(channel: DirectChannel): DirectChannel {
  return merge(new DirectChannel(), channel);
}
