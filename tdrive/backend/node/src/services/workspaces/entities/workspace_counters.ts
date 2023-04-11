import { Column, Entity } from "../../../core/platform/services/database/services/orm/decorators";

export const TYPE = "workspace_counters";

@Entity(TYPE, {
  primaryKey: [["id"], "counter_type"],
  type: TYPE,
})
export class WorkspaceCounterEntity {
  @Column("id", "timeuuid")
  id: string;

  @Column("counter_type", "string")
  counter_type: string;

  @Column("value", "counter")
  value: number;
}

export type WorkspaceCounterPrimaryKey = Pick<WorkspaceCounterEntity, "id" | "counter_type">;

export enum WorkspaceCounterType {
  MEMBERS = "members",
}
