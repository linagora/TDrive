import { FastifyInstance, FastifyRegisterOptions } from "fastify";
import routes from "./routes";

export default (
  fastify: FastifyInstance,
  options: FastifyRegisterOptions<{
    prefix: string;
  }>,
): void => {
  fastify.log.debug("Configuring /workspaces routes");
  fastify.register(routes, options);
};
