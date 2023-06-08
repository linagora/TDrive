import { DriveFile } from "../../entities/drive-file";
import User from "../../../user/entities/user";

export class DriveFileDTO extends DriveFile {
  created_by: User;
  shared_by: User;
}
