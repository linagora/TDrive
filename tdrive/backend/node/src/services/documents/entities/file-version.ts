import { Type } from "class-transformer";
import { Column, Entity } from "../../../core/platform/services/database/services/orm/decorators";

export const TYPE = "drive_file_versions";

@Entity(TYPE, {
  primaryKey: [["drive_item_id"], "id"],
  type: TYPE,
})
export class FileVersion {
  @Type(() => String)
  @Column("drive_item_id", "uuid")
  drive_item_id: string;

  @Type(() => String)
  @Column("id", "uuid", { generator: "uuid" })
  id: string;

  @Type(() => String)
  @Column("provider", "string")
  provider: "internal" | "drive" | string;

  @Column("file_metadata", "encoded_json")
  file_metadata: DriveFileMetadata;

  @Type(() => Number)
  @Column("date_added", "number")
  date_added: number;

  @Type(() => String)
  @Column("creator_id", "uuid")
  creator_id: string;

  @Type(() => String)
  @Column("application_id", "string")
  application_id: string;

  @Type(() => String)
  @Column("realname", "string")
  realname: string;

  @Type(() => String)
  @Column("key", "string")
  key: string;

  @Type(() => String)
  @Column("mode", "string")
  mode: string | "OpenSSL-2";

  @Type(() => Number)
  @Column("file_size", "number")
  file_size: number;

  @Type(() => String)
  @Column("filename", "string")
  filename: string;

  @Column("data", "encoded_json")
  data: unknown;
}

export type DriveFileMetadata = {
  source?: "internal" | "drive" | string;
  external_id: string;

  name?: string;
  mime?: string;
  size?: number;
  thumbnails?: DriveFileThumbnail[];
};

type DriveFileThumbnail = {
  index: number;
  id: string;

  type: string;
  size: number;
  width: number;
  height: number;

  url: string;
  full_url?: string;
};
