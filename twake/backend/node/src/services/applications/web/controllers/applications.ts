import { FastifyReply, FastifyRequest } from "fastify";
import { CrudController } from "../../../../core/platform/services/webserver/types";
import {
  PaginationQueryParameters,
  ResourceCreateResponse,
  ResourceDeleteResponse,
  ResourceGetResponse,
  ResourceListResponse,
  ResourceUpdateResponse,
} from "../../../../utils/types";
import Application, {
  ApplicationObject,
  PublicApplicationObject,
} from "../../entities/application";
import {
  CrudException,
  ExecutionContext,
  Pagination,
} from "../../../../core/platform/framework/api/crud-service";
import _ from "lodash";
import { randomBytes } from "crypto";
import { ApplicationEventRequestBody } from "../types";
import { logger as log } from "../../../../core/platform/framework";
import { hasCompanyAdminLevel } from "../../../../utils/company";
import gr from "../../../global-resolver";
import config from "../../../../core/config";
import axios from "axios";

export class ApplicationController
  implements
    CrudController<
      ResourceGetResponse<PublicApplicationObject>,
      ResourceUpdateResponse<PublicApplicationObject>,
      ResourceListResponse<PublicApplicationObject>,
      ResourceDeleteResponse
    >
{
  async get(
    request: FastifyRequest<{ Params: { application_id: string } }>,
  ): Promise<ResourceGetResponse<ApplicationObject | PublicApplicationObject>> {
    const context = getExecutionContext(request);

    const entity = await gr.services.applications.marketplaceApps.get(
      {
        id: request.params.application_id,
      },
      context,
    );

    const companyUser = await gr.services.companies.getCompanyUser(
      { id: entity.company_id },
      { id: context.user.id },
    );

    const isAdmin = companyUser && companyUser.role == "admin";

    return {
      resource: isAdmin ? entity.getApplicationObject() : entity.getPublicObject(),
    };
  }

  async list(
    request: FastifyRequest<{
      Querystring: PaginationQueryParameters & { search: string };
    }>,
  ): Promise<ResourceListResponse<PublicApplicationObject>> {
    const entities = await gr.services.applications.marketplaceApps.list(new Pagination(), {
      search: request.query.search,
    });
    return {
      resources: entities.getEntities(),
      next_page_token: entities.nextPage.page_token,
    };
  }

  async save(
    request: FastifyRequest<{
      Params: { application_id: string };
      Body: { resource: Application };
    }>,
    _reply: FastifyReply,
  ): Promise<ResourceGetResponse<ApplicationObject | PublicApplicationObject>> {
    const context = getExecutionContext(request);

    try {
      const app = request.body.resource;
      const now = new Date().getTime();
      const pluginsEndpoint = config.get("plugins.api");

      let entity: Application;

      if (request.params.application_id) {
        entity = await gr.services.applications.marketplaceApps.get(
          {
            id: request.params.application_id,
          },
          context,
        );

        if (!entity) {
          throw CrudException.notFound("Application not found");
        }

        entity.publication.requested = app.publication.requested;
        if (app.publication.requested === false) {
          entity.publication.published = false;
        }

        if (entity.publication.published) {
          if (
            !_.isEqual(
              _.pick(entity, "identity", "api", "access", "display"),
              _.pick(app, "identity", "api", "access", "display"),
            )
          ) {
            throw CrudException.badRequest(
              "You can't update applications details while it published",
            );
          }
        }

        entity.identity = app.identity;
        entity.api.hooks_url = app.api.hooks_url;
        entity.api.allowed_ips = app.api.allowed_ips;
        entity.access = app.access;
        entity.display = app.display;

        entity.stats.updated_at = now;
        entity.stats.version++;

        const res = await gr.services.applications.marketplaceApps.save(entity);
        entity = res.entity;
      } else {
        // INSERT

        app.is_default = false;
        app.publication.published = false;
        app.api.private_key = randomBytes(32).toString("base64");

        app.stats = {
          created_at: now,
          updated_at: now,
          version: 0,
        };

        const res = await gr.services.applications.marketplaceApps.save(app);
        entity = res.entity;
      }

      // SYNC PLUGINS
      if (app.identity.repository) {
        try {
          axios
            .post(
              `${pluginsEndpoint}/add`,
              {
                gitRepo: app.identity.repository,
                pluginId: entity.getApplicationObject().id,
                pluginSecret: entity.getApplicationObject().api.private_key,
              },
              {
                headers: {
                  "Content-Type": "application/json",
                },
              },
            )
            .then(response => {
              log.info(response.data);
            })
            .catch(error => {
              log.error(error);
            });
        } catch (error) {
          console.error(error);
        }
      }

      return {
        resource: entity.getApplicationObject(),
      };
    } catch (e) {
      log.error(e);
      throw e;
    }
  }

  async delete(
    request: FastifyRequest<{ Params: { application_id: string } }>,
    reply: FastifyReply,
  ): Promise<ResourceDeleteResponse> {
    const context = getExecutionContext(request);

    const application = await gr.services.applications.marketplaceApps.get(
      {
        id: request.params.application_id,
      },
      context,
    );

    const compUser = await gr.services.companies.getCompanyUser(
      { id: application.company_id },
      { id: context.user.id },
    );
    if (!compUser || !hasCompanyAdminLevel(compUser.role)) {
      throw CrudException.forbidden("You don't have the rights to delete this application");
    }

    const deleteResult = await gr.services.applications.marketplaceApps.delete(
      {
        id: request.params.application_id,
      },
      context,
    );

    if (deleteResult.deleted) {
      reply.code(204);

      return {
        status: "success",
      };
    }

    return {
      status: "error",
    };
  }

  async event(
    request: FastifyRequest<{
      Body: ApplicationEventRequestBody;
      Params: { application_id: string };
    }>,
    _reply: FastifyReply,
  ): Promise<ResourceCreateResponse<any>> {
    const context = getExecutionContext(request);

    const content = request.body.data;

    const applicationEntity = await gr.services.applications.marketplaceApps.get(
      {
        id: request.params.application_id,
      },
      context,
    );

    if (!applicationEntity) {
      throw CrudException.notFound("Application not found");
    }

    const companyUser = gr.services.companies.getCompanyUser(
      { id: request.body.company_id },
      { id: context.user.id },
    );

    if (!companyUser) {
      throw CrudException.badRequest(
        "You cannot send event to an application from another company",
      );
    }

    const applicationInCompany = await gr.services.applications.companyApps.get({
      company_id: request.body.company_id,
      application_id: request.params.application_id,
      id: undefined,
    });

    if (!applicationInCompany) {
      throw CrudException.badRequest("Application isn't installed in this company");
    }

    const hookResponse = await gr.services.applications.hooks.notifyApp(
      request.params.application_id,
      request.body.connection_id,
      context.user.id,
      request.body.type,
      request.body.name,
      content,
      request.body.company_id,
      request.body.workspace_id,
      context,
    );

    return {
      resource: hookResponse,
    };
  }
}

function getExecutionContext(request: FastifyRequest): ExecutionContext {
  return {
    user: request.currentUser,
    url: request.url,
    method: request.routerMethod,
    transport: "http",
  };
}
