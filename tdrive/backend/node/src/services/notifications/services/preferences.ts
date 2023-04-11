import _ from "lodash";
import { Initializable, TdriveServiceProvider } from "../../../core/platform/framework";
import {
  CrudException,
  DeleteResult,
  ExecutionContext,
  ListResult,
  OperationType,
  SaveResult,
} from "../../../core/platform/framework/api/crud-service";
import Repository from "../../../core/platform/services/database/services/orm/repository/repository";
import User, { UserNotificationPreferences } from "../../../services/user/entities/user";
import gr from "../../global-resolver";

type UserNotificationPreferencesPrimaryKey = {
  company_id: string;
  workspace_id: string;
  user_id: string;
};

export class NotificationPreferencesService implements TdriveServiceProvider, Initializable {
  version: "1";
  repository: Repository<UserNotificationPreferences>;

  async init(): Promise<this> {
    return this;
  }

  async list(): Promise<ListResult<UserNotificationPreferences>> {
    throw new Error("Not implemented");
  }

  async get(
    pk: UserNotificationPreferencesPrimaryKey,
    user?: User,
  ): Promise<UserNotificationPreferences> {
    user = user || (await gr.services.users.get({ id: pk.user_id }));
    const notificationPreferences = (user?.preferences?.notifications || []).find(n => {
      return n.company_id === pk.company_id && n.workspace_id === pk.workspace_id;
    });
    return (
      notificationPreferences || {
        company_id: pk.company_id,
        workspace_id: pk.workspace_id,
        preferences: {
          highlight_words: [],
          night_break: {
            enable: false,
            from: 0,
            to: 0,
          },
          private_message_content: false,
          mobile_notifications: "always",
          email_notifications_delay: 15,
          deactivate_notifications_until: 0,
          notification_sound: "default",
        },
      }
    );
  }

  /** We can define preferences for specifically a workspace or for all a company or all Tdrive
   * This function will ensure we get all with inherit and all
   */
  async getMerged(
    pk: UserNotificationPreferencesPrimaryKey,
    user?: User,
  ): Promise<UserNotificationPreferences> {
    let preferences = await this.get(pk, user);
    if (pk.workspace_id !== "all")
      preferences = _.merge(await this.get({ ...pk, workspace_id: "all" }), preferences);
    if (pk.company_id !== "all")
      preferences = _.merge(
        await this.get({ ...pk, workspace_id: "all", company_id: "all" }),
        preferences,
      );
    return preferences;
  }

  async delete(
    pk: UserNotificationPreferencesPrimaryKey,
    context?: ExecutionContext,
  ): Promise<DeleteResult<UserNotificationPreferences>> {
    const user = await gr.services.users.get({ id: pk.user_id });
    const notificationPreferences = (user?.preferences?.notifications || []).filter(n => {
      return n.company_id !== pk.company_id || n.workspace_id !== pk.workspace_id;
    });

    await gr.services.users.setPreferences(
      { id: pk.user_id },
      {
        notifications: notificationPreferences,
      },
      context,
    );

    return new DeleteResult("user_notifications_preference", pk as any, true);
  }

  async listPreferences(
    workspace_id: string,
    company_id: string,
    user_id: string,
  ): Promise<ListResult<UserNotificationPreferences>> {
    if (!workspace_id || !company_id || !user_id) {
      throw CrudException.badRequest("workspace_id, company_id and user_id are required");
    }

    const user = await gr.services.users.get({ id: user_id });

    const notificationPreferences = (user?.preferences?.notifications || []).filter(n => {
      return n.company_id === company_id && n.workspace_id === workspace_id;
    });

    return new ListResult("user_notifications_preference", notificationPreferences);
  }

  async savePreferences(
    singleNotificationPreferences: UserNotificationPreferences,
    userId: string,
    context: ExecutionContext,
  ): Promise<SaveResult<UserNotificationPreferences>> {
    const user = await gr.services.users.get({ id: userId });

    const notificationPreferences = (user?.preferences?.notifications || []).filter(n => {
      return (
        n.company_id !== singleNotificationPreferences.company_id ||
        n.workspace_id !== singleNotificationPreferences.workspace_id
      );
    });
    notificationPreferences.push(singleNotificationPreferences);

    await gr.services.users.setPreferences(
      { id: userId },
      {
        notifications: notificationPreferences,
      },
      context,
    );

    return new SaveResult(
      "user_notifications_preference",
      singleNotificationPreferences,
      OperationType.CREATE,
    );
  }
}
