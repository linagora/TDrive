import { FastifyInstance, FastifyPluginCallback, FastifyRequest } from "fastify";
import { ApplicationController } from "./controllers/applications";
import { CompanyApplicationController } from "./controllers/company-applications";

import Application from "../entities/application";
import { applicationEventHookSchema, applicationPostSchema } from "./schemas";
import { logger as log } from "../../../core/platform/framework";
import { checkUserBelongsToCompany, hasCompanyAdminLevel } from "../../../utils/company";
import gr from "../../global-resolver";

const applicationsUrl = "/applications";
const companyApplicationsUrl = "/companies/:company_id/applications";

const routes: FastifyPluginCallback = (fastify: FastifyInstance, options, next) => {
  const applicationController = new ApplicationController();
  const companyApplicationController = new CompanyApplicationController();

  const adminCheck = async (
    request: FastifyRequest<{
      Body: { resource: Application };
      Params: { application_id: string };
    }>,
  ) => {
    try {
      let companyId: string = request.body?.resource?.company_id;

      if (request.params.application_id) {
        const application = await gr.services.applications.marketplaceApps.get(
          {
            id: request.params.application_id,
          },
          undefined,
        );

        if (!application) {
          throw fastify.httpErrors.notFound("Application is not defined");
        }

        companyId = application.company_id;
      }

      const userId = request.currentUser.id;

      if (!companyId) {
        throw fastify.httpErrors.forbidden(`Company ${companyId} not found`);
      }

      const companyUser = await checkUserBelongsToCompany(userId, companyId);

      if (!hasCompanyAdminLevel(companyUser.role)) {
        throw fastify.httpErrors.forbidden("You must be an admin of this company");
      }
    } catch (e) {
      log.error(e);
      throw e;
    }
  };

  /**
   * Applications collection
   * Marketplace of applications
   */

  //Get and search list of applications in the marketplace
  fastify.route({
    method: "GET",
    url: `${applicationsUrl}`,
    preValidation: [fastify.authenticate],
    // schema: applicationGetSchema,
    handler: applicationController.list.bind(applicationController),
  });

  //Get a single application in the marketplace
  fastify.route({
    method: "GET",
    url: `${applicationsUrl}/:application_id`,
    preValidation: [fastify.authenticate],
    // schema: applicationGetSchema,
    handler: applicationController.get.bind(applicationController),
  });

  //Create application (must be my company application and I must be company admin)
  fastify.route({
    method: "POST",
    url: `${applicationsUrl}`,
    preHandler: [adminCheck],
    preValidation: [fastify.authenticate],
    schema: applicationPostSchema,
    handler: applicationController.save.bind(applicationController),
  });

  //Edit application (must be my company application and I must be company admin)
  fastify.route({
    method: "POST",
    url: `${applicationsUrl}/:application_id`,
    preHandler: [adminCheck],
    preValidation: [fastify.authenticate],
    schema: applicationPostSchema,
    handler: applicationController.save.bind(applicationController),
  });

  // Delete application (must be my company application and I must be company admin)
  fastify.route({
    method: "DELETE",
    url: `${applicationsUrl}/:application_id`,
    preHandler: [adminCheck],
    preValidation: [fastify.authenticate],
    handler: applicationController.delete.bind(applicationController),
  });

  /**
   * Company applications collection
   * Company-wide available applications
   * (must be my company application and I must be company admin)
   */

  //Get list of applications for a company
  fastify.route({
    method: "GET",
    url: `${companyApplicationsUrl}`,
    preValidation: [fastify.authenticate],
    handler: companyApplicationController.list.bind(companyApplicationController),
  });

  //Get one application of a company
  fastify.route({
    method: "GET",
    url: `${companyApplicationsUrl}/:application_id`,
    preValidation: [fastify.authenticate],
    handler: companyApplicationController.get.bind(companyApplicationController),
  });

  //Remove an application from a company
  fastify.route({
    method: "DELETE",
    url: `${companyApplicationsUrl}/:application_id`,
    preValidation: [fastify.authenticate],
    handler: companyApplicationController.delete.bind(companyApplicationController),
  });

  //Add an application to the company
  fastify.route({
    method: "POST",
    url: `${companyApplicationsUrl}/:application_id`,
    preValidation: [fastify.authenticate],
    handler: companyApplicationController.save.bind(companyApplicationController),
  });

  //Application event triggered by a user
  fastify.route({
    method: "POST",
    url: `${applicationsUrl}/:application_id/event`,
    preValidation: [fastify.authenticate],
    schema: applicationEventHookSchema,
    handler: applicationController.event.bind(applicationController),
  });

  next();
};

export default routes;
