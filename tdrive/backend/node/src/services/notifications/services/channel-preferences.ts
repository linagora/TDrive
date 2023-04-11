import _ from "lodash";
import {
  DeleteResult,
  ExecutionContext,
  ListResult,
  OperationType,
  SaveResult,
} from "../../../core/platform/framework/api/crud-service";
import {
  ChannelMemberNotificationPreference,
  ChannelMemberNotificationPreferencePrimaryKey,
} from "../entities";
import Repository from "../../../core/platform/services/database/services/orm/repository/repository";
import { Initializable, logger, TdriveServiceProvider } from "../../../core/platform/framework";
import gr from "../../global-resolver";

const TYPE = "channel_members_notification_preferences";

export class ChannelMemberPreferencesServiceImpl implements TdriveServiceProvider, Initializable {
  version: "1";
  repository: Repository<ChannelMemberNotificationPreference>;

  async init(): Promise<this> {
    this.repository = await gr.database.getRepository<ChannelMemberNotificationPreference>(
      TYPE,
      ChannelMemberNotificationPreference,
    );

    return this;
  }

  async save(
    entity: ChannelMemberNotificationPreference,
    context: ExecutionContext,
  ): Promise<SaveResult<ChannelMemberNotificationPreference>> {
    const pk: ChannelMemberNotificationPreferencePrimaryKey = {
      user_id: entity.user_id,
      company_id: entity.company_id,
      channel_id: entity.channel_id,
    };

    let preference = await this.repository.findOne(pk, {}, context);

    if (!preference) {
      preference = new ChannelMemberNotificationPreference();
      preference = _.merge(entity, pk);
    }

    preference = _.merge(preference, entity);

    await this.repository.save(preference, context);

    return new SaveResult(TYPE, preference, OperationType.CREATE);
  }

  async get(
    pk: ChannelMemberNotificationPreferencePrimaryKey,
    context: ExecutionContext,
  ): Promise<ChannelMemberNotificationPreference> {
    return await this.repository.findOne(pk, {}, context);
  }

  async delete(
    pk: ChannelMemberNotificationPreferencePrimaryKey,
    context?: ExecutionContext,
  ): Promise<DeleteResult<ChannelMemberNotificationPreference>> {
    await this.repository.remove(pk as ChannelMemberNotificationPreference, context);

    return new DeleteResult(TYPE, pk as ChannelMemberNotificationPreference, true);
  }

  list(): Promise<ListResult<ChannelMemberNotificationPreference>> {
    throw new Error("Not implemented");
  }

  async getChannelPreferencesForUsers(
    channelAndCompany: Pick<
      ChannelMemberNotificationPreferencePrimaryKey,
      "channel_id" | "company_id"
    >,
    users?: string[] | null,
    lastRead?: {
      lessThan: number;
    },
    context?: ExecutionContext,
  ): Promise<ListResult<ChannelMemberNotificationPreference>> {
    logger.debug(
      `ChannelMemberPreferenceService - Get Channel preferences for users ${JSON.stringify(
        users,
      )} with lastRead < ${lastRead?.lessThan}`,
    );
    const result = await this.repository.find(
      users ? { ...channelAndCompany, ...{ user_id: users } } : channelAndCompany,
      {},
      context,
    );

    if (result.getEntities().length > 0 && lastRead && lastRead.lessThan) {
      result.filterEntities(entity => entity.last_read < lastRead.lessThan);
    }

    logger.debug(
      `ChannelMemberPreferenceService - Result ${JSON.stringify(
        result.getEntities().map(preference => preference.user_id),
      )}`,
    );

    return result;
  }

  async getChannelPreferencesForUsersFilteredByReadTime(
    channelAndCompany: Pick<
      ChannelMemberNotificationPreferencePrimaryKey,
      "channel_id" | "company_id"
    >,
    users: string[] = [],
    lastRead: number,
    context?: ExecutionContext,
  ): Promise<ListResult<ChannelMemberNotificationPreference>> {
    const result = await this.repository.find(
      { ...channelAndCompany, ...{ user_id: users } },
      {},
      context,
    );

    if (result.getEntities().length > 0 && lastRead) {
      result.filterEntities(entity => entity.last_read < lastRead);
    }

    return result;
  }

  async updateLastRead(
    channelAndCompany: Pick<ChannelMemberNotificationPreference, "channel_id" | "company_id">,
    user_id: string,
    lastRead: number,
    context?: ExecutionContext,
  ): Promise<ChannelMemberNotificationPreference> {
    const pk: ChannelMemberNotificationPreferencePrimaryKey = {
      user_id,
      company_id: channelAndCompany.company_id,
      channel_id: channelAndCompany.channel_id,
    };

    const preference = await this.repository.findOne(pk, {}, context);

    if (!preference) {
      return;
    }

    preference.last_read = lastRead;

    await this.repository.save(preference, context);

    return preference;
  }
}
