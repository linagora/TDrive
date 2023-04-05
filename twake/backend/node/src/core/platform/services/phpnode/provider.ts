import { FastifyInstance, FastifyRequest, RouteHandlerMethod } from "fastify";
import { IncomingMessage, ServerResponse, Server } from "http";
import { TdriveServiceProvider } from "../../framework";

export default interface PhpNodeAPI extends TdriveServiceProvider {
  accessControl(
    request: FastifyRequest,
    server: FastifyInstance<Server, IncomingMessage, ServerResponse>,
  ): Promise<void>;
  register(parameters: { method: string; url: string; handler: RouteHandlerMethod }): void;
}
