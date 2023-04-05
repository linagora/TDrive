/* eslint-disable @typescript-eslint/no-unused-vars */
import { Initializable, TdriveServiceProvider } from "../../../core/platform/framework";
import { Paginable, Pagination } from "../../../core/platform/framework/api/crud-service";
import Repository from "../../../core/platform/services/database/services/orm/repository/repository";
import { Channel } from "../../../services/channels/entities";
import Workspace from "../../../services/workspaces/entities/workspace";
import gr from "../../global-resolver";
import { UserNotificationBadge } from "../entities";
import { getInstance, TYPE, UserNotificationDigest } from "../entities/user-notification-digest";

export class UserNotificationDigestService implements TdriveServiceProvider, Initializable {
  version: "1";
  repository: Repository<UserNotificationDigest>;

  async init(): Promise<this> {
    this.repository = await gr.database.getRepository<UserNotificationDigest>(
      TYPE,
      UserNotificationDigest,
    );

    gr.platformServices.cron.schedule(
      "*/15 * * * *",
      async () => {
        //This being multi-node we will try to avoid running them at the exact same time
        //Fixme: this is until we find a better solution of course
        await new Promise(r => setTimeout(r, 1000 * 60 * Math.random()));
        await this.processDigests();
      },
      "Find and process digests",
    );

    return this;
  }

  async getDigest(companyId: string, userId: string): Promise<UserNotificationDigest> {
    return await this.repository.findOne({ company_id: companyId, user_id: userId });
  }

  async cancelDigest(companyId: string, userId: string) {
    const digest = await this.getDigest(companyId, userId);
    if (digest) await this.repository.remove(digest);
  }

  async putBadge(badge: UserNotificationBadge): Promise<void> {
    const digest = await this.getDigest(badge.company_id, badge.user_id);
    let deliver_at = digest?.deliver_at;
    if (!deliver_at) {
      //Get user preferences to set the deliver at
      const preferences = await gr.services.notifications.preferences.getMerged({
        company_id: badge.company_id,
        user_id: badge.user_id,
        workspace_id: "all",
      });
      let emailNotificationsDelay = preferences?.preferences?.email_notifications_delay;
      if (emailNotificationsDelay === undefined) emailNotificationsDelay = 15;
      if (!emailNotificationsDelay) {
        return;
      } else {
        deliver_at = Date.now() + emailNotificationsDelay * 1000 * 60;
      }
    }
    await this.repository.save(
      getInstance({
        company_id: badge.company_id,
        user_id: badge.user_id,
        created_at: digest?.created_at || Date.now(),
        deliver_at,
      }),
    );
  }

  async processDigests(): Promise<void> {
    let digestsPagination: Paginable = new Pagination(null, "100");
    do {
      const digests = await this.repository.find({});
      const digestsEntities = digests.getEntities().filter(d => {
        return d.deliver_at < Date.now();
      });

      for (const digest of digestsEntities) {
        await this.repository.remove(digest);
      }

      for (const digest of digestsEntities) {
        await this.processDigest(digest);
      }

      digestsPagination = new Pagination(digests.nextPage.page_token, "100");
    } while (digestsPagination.page_token);
  }

  async processDigest(digest: UserNotificationDigest): Promise<void> {
    const badges = await gr.services.notifications.badges.listForUser(
      digest.company_id,
      digest.user_id,
      {} as any,
    );

    const user = await gr.services.users.get({ id: digest.user_id });
    const company = await gr.services.companies.getCompany({ id: digest.company_id });
    const notifications: {
      channel: Channel;
      workspace: Workspace;
    }[] = [];
    const workspaces: { [key: string]: Workspace } = {};
    const channels: { [key: string]: Channel } = {};

    for (const badge of badges.getEntities()) {
      if (!badge.thread_id) continue;
      try {
        channels[badge.channel_id] =
          channels[badge.channel_id] ||
          (await gr.services.channels.channels.get({
            company_id: badge.company_id,
            workspace_id: badge.workspace_id,
            id: badge.channel_id,
          }));

        workspaces[badge.workspace_id] =
          badge.workspace_id && badge.workspace_id !== "direct"
            ? workspaces[badge.workspace_id] ||
              (await gr.services.workspaces.get({
                company_id: badge.company_id,
                id: badge.workspace_id,
              }))
            : null;

        notifications.push({
          channel: channels[badge.channel_id],
          workspace: workspaces[badge.workspace_id],
        });
      } catch (e) {}
    }

    const etaEntry = {
      user,
      company,
      notifications,
    };

    if (notifications.length > 0) {
      const { html, text, subject } = await gr.platformServices.emailPusher.build(
        "notification-digest",
        user.language,
        etaEntry,
      );
      await gr.platformServices.emailPusher.send(user.email_canonical, {
        subject,
        html,
        text,
      });
    }
  }
}
