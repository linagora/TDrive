import { FastifyReply, FastifyRequest } from "fastify";
import { ExecutionContext } from "../../../../core/platform/framework/api/crud-service";
import { UserNotificationPreferences } from "../../../../services/user/entities/user";
import { handleError } from "../../../../utils/handleError";
import { ResourceCreateResponse, ResourceListResponse } from "../../../../utils/types";
import gr from "../../../global-resolver";
import { NotificationPreferenceListQueryParameters } from "../../types";

const ALL = "all";

export class NotificationPreferencesController {
  async list(
    request: FastifyRequest<{
      Querystring: NotificationPreferenceListQueryParameters;
    }>,
  ): Promise<ResourceListResponse<UserNotificationPreferences>> {
    const list = await gr.services.notifications.preferences.listPreferences(
      ALL,
      ALL,
      request.currentUser.id,
    );

    let resources = list.getEntities();

    if (!resources.length) {
      resources = [
        {
          company_id: ALL,
          workspace_id: ALL,
          preferences: {
            highlight_words: [],
            night_break: { enable: false, from: 0, to: 0 },
            private_message_content: false,
            mobile_notifications: "always",
            email_notifications_delay: 15,
            deactivate_notifications_until: 0,
            notification_sound: "default",
          },
        },
      ];
    }

    return { resources };
  }

  async save(
    request: FastifyRequest<{ Body: { resource: UserNotificationPreferences } }>,
    reply: FastifyReply,
    context?: ExecutionContext,
  ): Promise<ResourceCreateResponse<UserNotificationPreferences>> {
    const entity = {
      workspace_id: ALL,
      company_id: ALL,
      user_id: request.currentUser.id,
      preferences: {
        ...request.body.resource,
      },
    };

    try {
      const result = await gr.services.notifications.preferences.savePreferences(
        entity as UserNotificationPreferences,
        request.currentUser.id,
        context,
      );

      if (result) {
        reply.code(201);
      }

      return {
        resource: result.entity,
      };
    } catch (err) {
      handleError(reply, err);
    }
  }
}
