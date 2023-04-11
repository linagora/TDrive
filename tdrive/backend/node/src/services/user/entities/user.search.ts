import User from "./user";

export default {
  index: "user",
  source: (entity: User) => {
    const source: any = {
      first_name: entity.first_name,
      last_name: entity.last_name,
      email: entity.email_canonical,
      username: entity.username_canonical,
    };
    if (entity.cache?.companies) {
      return {
        companies: entity.cache?.companies,
        ...source,
      };
    }
    return source;
  },
  mongoMapping: {
    text: {
      first_name: "text",
      last_name: "text",
      email: "text",
      username: "text",
    },
    prefix: {
      first_name: "prefix",
      last_name: "prefix",
      email: "prefix",
      username: "prefix",
    },
  },
  esMapping: {
    properties: {
      first_name: { type: "text", index_prefixes: { min_chars: 1 } },
      last_name: { type: "text", index_prefixes: { min_chars: 1 } },
      email: { type: "text", index_prefixes: { min_chars: 1 } },
      username: { type: "text", index_prefixes: { min_chars: 1 } },
      companies: { type: "keyword" },
    },
  },
};
