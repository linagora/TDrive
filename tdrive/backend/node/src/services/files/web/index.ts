import { FastifyInstance, FastifyRegisterOptions } from "fastify";
import fastifyCaching from "@fastify/caching";
import routes from "./routes";

export default (
  fastify: FastifyInstance,
  options: FastifyRegisterOptions<{ prefix: string }>,
): void => {
  fastify.log.debug("Configuring /internal/services/files/v1 routes");
  fastify.register(fastifyCaching, { expiresIn: 31536000, privacy: fastifyCaching.privacy.PUBLIC });
  fastify.register(routes, options);
};
