import {
  DeleteResult,
  ExecutionContext,
  ListResult,
  OperationType,
  SaveResult,
} from "../../../core/platform/framework/api/crud-service";
import {
  ChannelThreadUsers,
  ChannelThreadUsersPrimaryKey,
  ChannelThreadUsersType,
} from "../entities";
import Repository from "../../../core/platform/services/database/services/orm/repository/repository";
import gr from "../../global-resolver";
import { Initializable, TdriveServiceProvider } from "../../../core/platform/framework";

export class ChannelThreadUsersServiceImpl implements TdriveServiceProvider, Initializable {
  version: "1";
  repository: Repository<ChannelThreadUsers>;

  async init(): Promise<this> {
    this.repository = await gr.database.getRepository<ChannelThreadUsers>(
      ChannelThreadUsersType,
      ChannelThreadUsers,
    );

    return this;
  }

  async bulkSave(
    entities: ChannelThreadUsers[],
    context: ExecutionContext,
  ): Promise<SaveResult<ChannelThreadUsers[]>> {
    await this.repository.saveAll(entities, context);

    return new SaveResult(ChannelThreadUsersType, entities, OperationType.CREATE);
  }

  async get(
    pk: ChannelThreadUsersPrimaryKey,
    context: ExecutionContext,
  ): Promise<ChannelThreadUsers> {
    return await this.repository.findOne(pk, {}, context);
  }

  async delete(
    pk: ChannelThreadUsersPrimaryKey,
    context: ExecutionContext,
  ): Promise<DeleteResult<ChannelThreadUsers>> {
    await this.repository.remove(pk as ChannelThreadUsers, context);

    return new DeleteResult(ChannelThreadUsersType, pk as ChannelThreadUsers, true);
  }

  list(): Promise<ListResult<ChannelThreadUsers>> {
    throw new Error("Not implemented");
  }

  async getUsersInThread(
    pk: ChannelThreadUsersPrimaryKey,
    context: ExecutionContext,
  ): Promise<ListResult<ChannelThreadUsers>> {
    if (!pk.company_id || !pk.channel_id || !pk.thread_id) {
      throw new Error("Missing required fields");
    }
    return this.repository.find(pk, {}, context);
  }
}
