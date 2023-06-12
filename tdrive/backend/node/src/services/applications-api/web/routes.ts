import { FastifyInstance, FastifyPluginCallback, FastifyRequest } from "fastify";

import { ApplicationsApiController } from "./controllers";
import { ApplicationApiBaseRequest } from "./types";
import { logger as log } from "../../../core/platform/framework";
import { configureRequestSchema } from "./schemas";

const routes: FastifyPluginCallback = (fastify: FastifyInstance, options, next) => {
  const controller = new ApplicationsApiController();

  const checkApplication = async (request: FastifyRequest<{ Body: ApplicationApiBaseRequest }>) => {
    if (!request.currentUser.application_id) {
      log.debug(request.currentUser);
      throw fastify.httpErrors.forbidden("You should log in as application");
    }
  };

  //Authenticate the application
  fastify.route({
    method: "POST",
    url: "/console/v1/login",
    handler: controller.token.bind(controller),
  });

  //Get myself as an application
  fastify.route({
    method: "GET",
    url: "/console/v1/me",
    preValidation: [fastify.authenticate],
    preHandler: [checkApplication],
    handler: controller.me.bind(controller),
  });

  //Open a configuration popup on the client side
  fastify.route({
    method: "POST",
    url: "/console/v1/configure",
    preValidation: [fastify.authenticate],
    schema: configureRequestSchema,
    handler: controller.configure.bind(controller),
  });

  //Get myself as an application
  fastify.route({
    method: ["POST", "GET", "DELETE", "PUT"],
    url: "/:service/:version/companies/:company_id/*",
    preValidation: [fastify.authenticate],
    handler: (request, reply) => controller.proxy.bind(controller)(request, reply, fastify),
  });

  // Sync SSO users
  fastify.route({
    method: "POST",
    url: "/sync",
    preValidation: [fastify.authenticate],
    preHandler: [checkApplication],
    handler: controller.syncUsers.bind(controller),
  });

  next();
};

export default routes;
