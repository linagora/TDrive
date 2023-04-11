import { Type } from "class-transformer";
import _ from "lodash";
import { Column, Entity } from "../../../core/platform/services/database/services/orm/decorators";

@Entity("files", {
  primaryKey: [["company_id"], "id"],
  type: "files",
})
export class File {
  @Type(() => String)
  @Column("company_id", "uuid")
  company_id: string;

  @Type(() => String)
  @Column("id", "uuid", { generator: "uuid" })
  id: string;

  @Type(() => String)
  @Column("user_id", "encoded_string")
  user_id: string;

  @Column("application_id", "encoded_string")
  application_id: null | string;

  @Column("encryption_key", "encoded_string")
  encryption_key: string;

  @Column("updated_at", "number", { onUpsert: _ => new Date().getTime() })
  updated_at: number;

  @Column("created_at", "number", { onUpsert: d => d || new Date().getTime() })
  created_at: number;

  @Column("metadata", "encoded_json")
  metadata: null | {
    name?: string;
    mime?: string;
    thumbnails_status?: "done" | "error" | "waiting";
  };

  @Column("thumbnails", "encoded_json")
  thumbnails: Thumbnail[];

  @Column("upload_data", "encoded_json")
  upload_data: null | {
    size: number;
    chunks: number;
  };

  getPublicObject(): PublicFile {
    return _.pick(
      this,
      "company_id",
      "id",
      "user_id",
      "application_id",
      "updated_at",
      "created_at",
      "metadata",
      "thumbnails",
      "upload_data",
    );
  }
}

export type PublicFile = Pick<
  File,
  | "company_id"
  | "id"
  | "user_id"
  | "application_id"
  | "updated_at"
  | "created_at"
  | "metadata"
  | "thumbnails"
  | "upload_data"
>;

export type Thumbnail = {
  index: number;
  id: string;

  type: string;
  size: number;
  width: number;
  height: number;

  url: string;
  full_url?: string;
};
