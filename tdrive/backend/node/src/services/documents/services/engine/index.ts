import globalResolver from "../../../global-resolver";
import { Initializable } from "../../../../core/platform/framework";
import { DocumentsProcessor } from "./extract-keywords";
import { DriveFile, TYPE } from "../../entities/drive-file";
import { DocumentsFinishedProcess } from "./save-keywords";

export class DocumentsEngine implements Initializable {
  async init(): Promise<this> {
    const repository = await globalResolver.database.getRepository<DriveFile>(TYPE, DriveFile);

    globalResolver.platformServices.messageQueue.processor.addHandler(new DocumentsProcessor());
    globalResolver.platformServices.messageQueue.processor.addHandler(
      new DocumentsFinishedProcess(repository),
    );

    return this;
  }
}
