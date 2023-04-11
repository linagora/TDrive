import { Type } from "class-transformer";
import { merge } from "lodash";
import { Column, Entity } from "../../../core/platform/services/database/services/orm/decorators";
import { ChannelType } from "../types";

@Entity("default_channels", {
  primaryKey: [["company_id", "workspace_id"], "channel_id"],
  type: "default_channels",
})
export class DefaultChannel {
  // uuid-v4
  @Type(() => String)
  @Column("company_id", "string", { generator: "uuid" })
  company_id: string;

  // "uuid-v4" | "direct"
  @Type(() => String)
  @Column("workspace_id", "string", { generator: "uuid" })
  workspace_id: string | ChannelType.DIRECT;

  // uuid-v4
  @Type(() => String)
  @Column("channel_id", "string", { generator: "uuid" })
  channel_id: string;
}

export type DefaultChannelPrimaryKey = Pick<
  DefaultChannel,
  "channel_id" | "company_id" | "workspace_id"
>;

export function getInstance(channel: DefaultChannel): DefaultChannel {
  return merge(new DefaultChannel(), channel);
}
