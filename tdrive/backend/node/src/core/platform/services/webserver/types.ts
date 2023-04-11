import { FastifyReply, FastifyRequest } from "fastify";

export interface CrudHandler<T> {
  (request: FastifyRequest, reply?: FastifyReply): Promise<T>;
}

export interface CrudController<
  GetResponseType,
  SaveResponseType,
  ListResponseType,
  DeleteResponseType,
> {
  get?: CrudHandler<GetResponseType>;
  save?: CrudHandler<SaveResponseType>;
  list?: CrudHandler<ListResponseType>;
  delete?: CrudHandler<DeleteResponseType>;
}
