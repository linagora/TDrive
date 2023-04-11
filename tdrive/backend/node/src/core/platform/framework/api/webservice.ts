import { PREFIX_METADATA } from "./constants";
import { FastifyInstance, FastifyPluginCallback } from "fastify";

import gr from "../../../../services/global-resolver";

export abstract class AbstractWebService {
  abstract routes(fastify: FastifyInstance): void;

  public get prefix(): string {
    return Reflect.getMetadata(PREFIX_METADATA, this) || "/";
  }

  public process(): void {
    const wrapper: FastifyPluginCallback = (fastify: FastifyInstance, options, next) => {
      this.routes(fastify);
      next();
    };

    gr.fastify.register(wrapper, { prefix: this.prefix });
  }
}
