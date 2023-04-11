import { merge } from "lodash";
import { Column, Entity } from "../../../core/platform/services/database/services/orm/decorators";
import { uuid } from "../../../utils/types";

export const TYPE = "devices";

@Entity(TYPE, {
  primaryKey: [["id"]],
  type: TYPE,
})
export default class Device {
  @Column("id", "string")
  id: string;

  @Column("user_id", "uuid")
  user_id: uuid;

  @Column("type", "string")
  type: string;

  @Column("version", "string")
  version: string;

  @Column("push_notifications", "boolean")
  push_notifications: boolean;
}

export type UserDevicePrimaryKey = Pick<Device, "id">;

export function getInstance(userDevice: Partial<Device> & UserDevicePrimaryKey): Device {
  return merge(new Device(), userDevice);
}
