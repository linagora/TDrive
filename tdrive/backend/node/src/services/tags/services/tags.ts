import { TdriveServiceProvider, Initializable } from "src/core/platform/framework/api";
import Repository from "src/core/platform/services/database/services/orm/repository/repository";
import { Tag, TagsType, TagsPrimaryKey } from "../entities";
import gr from "../../global-resolver";
import {
  DeleteResult,
  ExecutionContext,
  ListResult,
  OperationType,
  SaveResult,
} from "../../../core/platform/framework/api/crud-service";
import { plainToClass } from "class-transformer";
import { createTagEntity, TYPE } from "../entities/tags";
import { logger } from "../../../core/platform/framework";

export class TagsService implements TdriveServiceProvider, Initializable {
  version: "1";
  repository: Repository<Tag>;

  async init(): Promise<this> {
    try {
      this.repository = await gr.database.getRepository<Tag>(TYPE, Tag);
    } catch (err) {
      console.log(err);
      logger.error("Error while initializing tags service");
    }
    return this;
  }

  async get(pk: TagsPrimaryKey): Promise<Tag> {
    return await this.repository.findOne({ company_id: pk.company_id, tag_id: pk.tag_id });
  }

  async save(tag: Tag, context: ExecutionContext): Promise<SaveResult<Tag>> {
    const tagToSave = createTagEntity(tag);
    tagToSave.tag_id = tag.name.toLocaleLowerCase().replace(/[^a-z0-9]/gm, "_");
    await this.repository.save(tagToSave, context);
    return new SaveResult(TagsType, tagToSave, OperationType.CREATE);
  }

  async delete(pk: TagsPrimaryKey, context: ExecutionContext): Promise<DeleteResult<Tag>> {
    const tag = await this.get(pk);
    const entity = createTagEntity(tag);
    await this.repository.remove(entity, context);
    return new DeleteResult(TagsType, entity, true);
  }

  async list(pk: { company_id: string }): Promise<ListResult<Tag>> {
    const result = await this.repository.find({
      company_id: pk.company_id,
    });

    return new ListResult<Tag>(
      "tags",
      result.getEntities().map(tag => plainToClass(Tag, { tag_id: tag.tag_id, ...tag })),
      result.nextPage,
    );
  }
}
