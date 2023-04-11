import fastifyCaching from "@fastify/caching";
import { FastifyInstance, FastifyRegisterOptions } from "fastify";
import routes from "./routes";

export default (
  fastify: FastifyInstance,
  options: FastifyRegisterOptions<{ prefix: string }>,
): void => {
  fastify.log.debug("configuring /internal/services/documents/v1 routes");
  fastify.register(fastifyCaching, { expiresIn: 31536000, privacy: fastifyCaching.privacy.PUBLIC });
  fastify.register(routes, options);
};
