import { logger } from "../../../../core/platform/framework";
import { ExecutionContext } from "../../../../core/platform/framework/api/crud-service";
import Repository from "../../../../core/platform/services/database/services/orm/repository/repository";
import { MessageQueueHandler } from "../../../../core/platform/services/message-queue/api";
import { DriveFile } from "../../entities/drive-file";
import { DocumentsMessageQueueCallback } from "../../types";

export class DocumentsFinishedProcess
  implements MessageQueueHandler<DocumentsMessageQueueCallback, void>
{
  constructor(private repository: Repository<DriveFile>) {}

  readonly name = "DocumentsFinishedProcess";
  readonly topics = {
    in: "services:documents:process:callback",
  };

  readonly options = {
    unique: true,
    ack: true,
  };

  init? = (): Promise<this> => {
    throw Error("Method not implemented.");
  };

  validate = (message: DocumentsMessageQueueCallback): boolean => {
    return !!(
      message &&
      message.content_keywords &&
      message.content_keywords.length &&
      message.item &&
      message.item.id
    );
  };

  process = async (
    message: DocumentsMessageQueueCallback,
    context?: ExecutionContext,
  ): Promise<void> => {
    logger.info(`${this.name} - updating drive item content keywords`);

    try {
      const entity = await this.repository.findOne(
        {
          id: message.item.id,
          company_id: message.item.company_id,
        },
        {},
        context,
      );

      if (!entity) {
        throw Error("Drive item not found");
      }

      entity.content_keywords = message.content_keywords;

      return await this.repository.save(entity, context);
    } catch (error) {
      logger.error(`${this.name} - Failed to set content keywords`, error);
      return;
    }
  };
}
