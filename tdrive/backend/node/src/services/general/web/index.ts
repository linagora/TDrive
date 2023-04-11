import { FastifyInstance, FastifyRegisterOptions } from "fastify";
import { ServerConfiguration } from "../types";
import routes from "./routes";

export default (
  fastify: FastifyInstance,
  options: FastifyRegisterOptions<{
    prefix: string;
    configuration: ServerConfiguration["configuration"];
  }>,
): void => {
  fastify.log.debug("Configuring /internal/services/general/v1 routes");
  fastify.register(routes, options);
};
