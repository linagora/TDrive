import globalResolver from "../../../../services/global-resolver";
import { logger } from "../../../../core/platform/framework";
import { MessageQueueHandler } from "../../../../core/platform/services/message-queue/api";
import { DocumentsMessageQueueCallback, DocumentsMessageQueueRequest } from "../../types";
import { extractKeywords, officeFileToString, pdfFileToString, isFileType } from "../../utils";
import { officeExtensions, textExtensions, pdfExtensions } from "../../../../utils/mime";
import { readableToString } from "../../../../utils/files";

export class DocumentsProcessor
  implements MessageQueueHandler<DocumentsMessageQueueRequest, DocumentsMessageQueueCallback>
{
  readonly name = "DocumentsProcessor";

  readonly topics = {
    in: "services:documents:process",
    out: "services:documents:process:callback",
  };

  readonly options = {
    unique: true,
    ack: true,
  };

  validate(message: DocumentsMessageQueueRequest): boolean {
    return !!(
      message &&
      message.context &&
      message.item &&
      message.item.id &&
      message.version &&
      message.version.file_metadata &&
      message.version.file_metadata.external_id &&
      !message.item.is_directory
    );
  }

  async process(message: DocumentsMessageQueueRequest): Promise<DocumentsMessageQueueCallback> {
    logger.info(`${this.name} - process document content keywords for ${message.item.id}`);

    return await this.generate(message);
  }

  async generate(message: DocumentsMessageQueueRequest): Promise<DocumentsMessageQueueCallback> {
    let content_keywords = "";
    let content_strings = "";
/*
    try {
      const storedFile = await globalResolver.services.files.download(
        message.version.file_metadata.external_id,
        message.context,
      );

      const extension = storedFile.name.split(".").pop();

      if (isFileType(storedFile.mime, storedFile.name, textExtensions)) {
        logger.info("Processing text file");
        content_strings = await readableToString(storedFile.file);
      }

      if (isFileType(storedFile.mime, storedFile.name, pdfExtensions)) {
        logger.info("Processing PDF file");
        content_strings = await pdfFileToString(storedFile.file);
      }

      if (isFileType(storedFile.mime, storedFile.name, officeExtensions)) {
        logger.info("Processing office file");
        content_strings = await officeFileToString(storedFile.file, extension);
      }

      content_keywords = extractKeywords(content_strings);
    } catch (error) {
      console.debug(error);
      logger.error("Failed to generate content keywords", error);
    }
*/
    return { content_keywords, item: message.item };
  }
}
