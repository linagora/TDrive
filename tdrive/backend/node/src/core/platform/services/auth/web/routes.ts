import { FastifyInstance, FastifyPluginCallback } from "fastify";
import { v4 as uuidv4 } from "uuid";

const routes: FastifyPluginCallback = (fastify: FastifyInstance, _opts, next) => {
  fastify.get("/login", async (_request, reply) => {
    const userId = uuidv4();
    reply.send({
      token: fastify.jwt.sign({ sub: userId }),
      user: {
        id: userId,
      },
    });
  });

  next();
};

export default routes;
