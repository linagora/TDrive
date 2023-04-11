import { Type } from "class-transformer";
import { Column, Entity } from "../../../core/platform/services/database/services/orm/decorators";

export const TYPE = "tags";
/**
 * Table tags
 */
@Entity(TYPE, {
  primaryKey: [["company_id"], "tag_id"],
  type: TYPE,
})
export class Tag {
  /**
   * UUIDv4
   * Primary key / partition key
   * Company ID
   */
  @Type(() => String)
  @Column("company_id", "uuid")
  company_id: string;

  /**
   * UUIDv4
   * Primary key / sort key
   * Tag id
   */
  @Type(() => String)
  @Column("tag_id", "string")
  tag_id: string;

  /**
   * name
   */
  @Type(() => String)
  @Column("name", "string")
  name: string;

  /**
   * colour
   */
  @Type(() => String)
  @Column("colour", "string")
  colour: string;
}

export type TagsPrimaryKey = Pick<Tag, "company_id" | "tag_id">;

export const createTagEntity = (tag?: Partial<Tag>): Tag => {
  return Object.assign(new Tag(), {
    ...tag,
  });
};
