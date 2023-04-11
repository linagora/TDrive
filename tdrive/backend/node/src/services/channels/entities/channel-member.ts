import { Type } from "class-transformer";
import { merge } from "lodash";
import { Column, Entity } from "../../../core/platform/services/database/services/orm/decorators";
import { ChannelMemberNotificationLevel, ChannelMemberType } from "../types";
import { UserObject } from "../../../services/user/web/types";

/**
 * Defines the member <-> channel link and member settings in channel
 * Table name is `user_channels`
 */
@Entity("user_channels", {
  primaryKey: [["company_id", "workspace_id"], "user_id", "channel_id"],
  type: "user_channels",
})
export class ChannelMember {
  /**
   * Primary key
   */
  @Type(() => String)
  @Column("company_id", "uuid", { generator: "uuid" })
  company_id: string;

  /**
   * Primary key
   * Null for direct channels
   */
  @Type(() => String)
  @Column("workspace_id", "string")
  workspace_id: string;

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

  @Column("type", "string")
  type: ChannelMemberType = ChannelMemberType.MEMBER;

  /**
   * Timestamp in secconds
   */
  @Column("last_access", "number")
  last_access: number;

  /**
   * When last updated
   */
  @Column("last_increment", "number")
  last_increment: number;

  /**
   * Member marked this channel as favorite?
   */
  @Column("favorite", "boolean")
  favorite = false;

  /**
   * Member defined the notification level for the channel
   * Defaults to all
   */
  @Column("notification_level", "string")
  notification_level: ChannelMemberNotificationLevel = ChannelMemberNotificationLevel.ALL;

  /**
   * Member expiration in channel (only for guests)
   */
  @Column("expiration", "number")
  expiration: boolean | number;

  /**
   * Every collection entity must have an id, here it is the user_id
   */
  @Type(() => String)
  @Column("id", "string")
  id: string;

  @Column("updated_at", "number", { onUpsert: _ => new Date().getTime() })
  updated_at: number;

  @Column("created_at", "number", { onUpsert: d => d || new Date().getTime() })
  created_at: number;
}

export type ChannelMemberPrimaryKey = Pick<
  ChannelMember,
  "channel_id" | "company_id" | "user_id" | "workspace_id"
>;

export function getChannelMemberInstance(member: Partial<ChannelMember>): ChannelMember {
  return merge(new ChannelMember(), member);
}

export type ChannelMemberWithUser = ChannelMember & { user: UserObject };

/**
 * The channel_members table allows to get all the members of a channel.
 * Table name is `channel_members`
 */
@Entity("channel_members", {
  primaryKey: [["company_id", "workspace_id"], "channel_id", "user_id"],
  type: "channel_members",
})
export class MemberOfChannel {
  /**
   * Primary key
   */
  @Type(() => String)
  @Column("company_id", "uuid", { generator: "uuid" })
  company_id: string;

  @Type(() => String)
  @Column("workspace_id", "string")
  workspace_id: string;

  @Type(() => String)
  @Column("user_id", "uuid")
  user_id: string;

  @Type(() => String)
  @Column("channel_id", "uuid")
  channel_id: string;

  @Column("type", "string")
  type: ChannelMemberType = ChannelMemberType.MEMBER;
}

export function getMemberOfChannelInstance(member: Partial<MemberOfChannel>): MemberOfChannel {
  return merge(new MemberOfChannel(), member);
}
