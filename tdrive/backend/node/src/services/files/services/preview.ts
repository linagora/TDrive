import { logger, TdriveContext } from "../../../core/platform/framework";
import { PreviewMessageQueueCallback } from "../../../../src/services/previews/types";
import Repository from "../../../../src/core/platform/services/database/services/orm/repository/repository";
import { File } from "../entities/file";
import { FileServiceImpl } from "./index";
import { MessageQueueHandler } from "../../../core/platform/services/message-queue/api";
import { ExecutionContext } from "../../../core/platform/framework/api/crud-service";

/**
 * Update the file metadata and upload the thumbnails in storage
 */
export class PreviewFinishedProcessor
  implements MessageQueueHandler<PreviewMessageQueueCallback, string>
{
  constructor(readonly service: FileServiceImpl, private repository: Repository<File>) {}

  async init(_context?: TdriveContext): Promise<this> {
    return this;
  }

  readonly topics = {
    in: "services:preview:callback",
  };

  readonly options = {
    unique: true,
    ack: true,
  };

  name = "FilePreviewProcessor";

  validate(message: PreviewMessageQueueCallback): boolean {
    return !!(message && message.document);
  }

  async process(message: PreviewMessageQueueCallback, context?: ExecutionContext): Promise<string> {
    logger.info(
      `${this.name} - Updating file metadata with preview generation ${message.thumbnails.length}`,
    );

    const pk: { company_id: string; id: string } = JSON.parse(message.document.id);
    const entity = await this.repository.findOne(pk, {}, context);

    if (!entity) {
      logger.info(`This file ${message.document.id} does not exists anymore.`);
      return;
    }

    entity.thumbnails = (message.thumbnails || []).map((thumb, index) => {
      return {
        index,
        id: thumb.path.split("/").pop(),
        size: thumb.size,
        type: thumb.type,
        width: thumb.width,
        height: thumb.height,
        url: `/internal/services/files/v1/companies/${entity.company_id}/files/${entity.id}/thumbnails/${index}`,
      };
    });

    if (!entity.metadata) entity.metadata = {};
    entity.metadata.thumbnails_status = "done";

    await this.repository.save(entity, context);
    return "done";
  }
}
