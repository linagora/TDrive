import { FastifyRequest } from "fastify";
import { CrudController } from "../../../../core/platform/services/webserver/types";
import { NotificationListQueryParameters } from "../../types";
import {
  ResourceCreateResponse,
  ResourceDeleteResponse,
  ResourceGetResponse,
  ResourceListResponse,
} from "../../../../utils/types";
import { UserNotificationBadge } from "../../entities";
import { getWebsocketInformation } from "../../services/realtime";
import gr from "../../../global-resolver";
import { WorkspaceExecutionContext } from "../../../channels/types";

export class NotificationController
  implements
    CrudController<
      ResourceGetResponse<UserNotificationBadge>,
      ResourceCreateResponse<UserNotificationBadge>,
      ResourceListResponse<UserNotificationBadge>,
      ResourceDeleteResponse
    >
{
  async list(
    request: FastifyRequest<{
      Querystring: NotificationListQueryParameters;
    }>,
  ): Promise<ResourceListResponse<UserNotificationBadge>> {
    const context = getExecutionContext(request);

    let resources: UserNotificationBadge[] = [];
    let page_token = "";

    //Get one badge per company if requested
    if (request.query.all_companies) {
      const list = await gr.services.notifications.badges.listForUserPerCompanies(
        request.currentUser.id,
        context,
      );
      resources = resources.concat(list.getEntities());
    }

    if (request.query.company_id) {
      const list = await gr.services.notifications.badges.listForUser(
        request.query.company_id,
        request.currentUser.id,
        { ...request.query },
        context,
      );
      resources = resources.concat(list.getEntities());
      page_token = list.page_token;
    }

    return {
      ...{
        resources,
      },
      ...(request.query.websockets && {
        websockets: gr.platformServices.realtime.sign(
          [getWebsocketInformation(request.currentUser)],
          request.currentUser.id,
        ),
      }),
      ...(page_token && {
        next_page_token: page_token,
      }),
    };
  }
}

function getExecutionContext(request: FastifyRequest): WorkspaceExecutionContext {
  return {
    user: request.currentUser,
    url: request.url,
    method: request.routerMethod,
    reqId: request.id,
    transport: "http",
    workspace: {
      company_id: undefined,
      workspace_id: undefined,
    },
  };
}
