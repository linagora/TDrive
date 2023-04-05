import { Server, IncomingMessage, ServerResponse } from "http";
import { FastifyInstance } from "fastify";
import { TdriveServiceProvider } from "../../framework/api";

export default interface WebServerAPI extends TdriveServiceProvider {
  /**
   * Get the fastify webserver instance
   */
  getServer(): FastifyInstance<Server, IncomingMessage, ServerResponse>;

  // eslint-disable-next-line @typescript-eslint/ban-types
  onReady(handler: Function): void;
}
