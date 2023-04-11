import { FastifyInstance, FastifyRegisterOptions } from "fastify";
import routes from "./routes";

export default (
  fastify: FastifyInstance,
  options: FastifyRegisterOptions<{
    prefix: string;
  }>,
): void => {
  fastify.log.debug("Configuring /internal/services/channels/v1 routes");
  fastify.register(routes, options);
};
