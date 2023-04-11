import { merge } from "lodash";
import { Column, Entity } from "../../../core/platform/services/database/services/orm/decorators";

export const TYPE = "statistics";

@Entity(TYPE, {
  primaryKey: [["company_id", "event_name"], "month_id"],
  type: TYPE,
})
export default class StatisticsEntity {
  @Column("company_id", "string")
  company_id: string;

  @Column("event_name", "string")
  event_name: string;

  @Column("month_id", "number")
  month_id: number;

  @Column("value", "counter")
  value: number;
}

export type StatisticsPrimaryKey = Pick<StatisticsEntity, "company_id" | "event_name" | "month_id">;

export function getInstance(
  statisticsEntity: Partial<StatisticsEntity> & StatisticsPrimaryKey,
): StatisticsEntity {
  return merge(new StatisticsEntity(), statisticsEntity);
}
