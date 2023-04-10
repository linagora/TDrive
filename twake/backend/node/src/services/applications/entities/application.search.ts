import Application, { TYPE } from "./application";

export default {
  index: TYPE,
  source: (entity: Application) => {
    return {
      company_id: entity.company_id,
      name: entity.identity.name,
      description: entity.identity.description,
      categories: entity.identity.categories,
      compatibility: entity.identity.compatibility,
      published: entity.publication.published,
      created_at: entity.stats.created_at,
    };
  },
  mongoMapping: {
    text: {
      name: "text",
      description: "text",
    },
  },
  esMapping: {
    properties: {
      company_id: { type: "keyword" },
      name: { type: "text", index_prefixes: { min_chars: 1 } },
      description: { type: "text" },
      categories: { type: "keyword" },
      compatibility: { type: "keyword" },
      published: { type: "boolean" },
      created_at: { type: "number" },
    },
  },
};
