import { FastifyInstance, FastifyPluginCallback, FastifyReply, FastifyRequest } from "fastify";
import { KnowledgeGraphCallbackEvent } from "../../../core/platform/services/knowledge-graph/types";
import gr from "../../global-resolver";

const routes: FastifyPluginCallback = (fastify: FastifyInstance, _, next) => {
  fastify.route({
    method: "POST",
    url: "/push",
    handler: async (
      request: FastifyRequest<{
        Body: {
          events: KnowledgeGraphCallbackEvent[];
        };
      }>,
      reply: FastifyReply,
    ): Promise<any> => {
      try {
        for (let i = 0; i < request.body.events.length; i++) {
          await gr.platformServices.knowledgeGraph.onCallbackEvent(
            request.headers.authorization.split(" ")[1],
            request.body.events[i],
          );
        }
      } catch (e) {
        reply.status(500).send({
          status: "error",
          error: "Internal server error",
          message: e.message || "Unknown error",
        });
      }

      reply.status(200).send({
        status: "success",
      });
    },
  });

  next();
};

export default routes;
