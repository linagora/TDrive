import { DriveFile, TYPE } from "./drive-file";

export default {
  index: TYPE,
  source: (entity: DriveFile) => ({
    content_keywords: entity.content_keywords,
    tags: (entity.tags || []).join(" "),
    creator: entity.creator,
    added: entity.added,
    name: entity.name,
    company_id: entity.company_id,
    access_users: ["user_1234", "user_454"],
    access_users_x_initiator: ["user_1234_x_user_4343", "user_1234_x_user_4343"],

    access_entities: [
      {
        type: "user",
        level: "read",
        target: "user_1234",
        source: "user_5678",
      },
      {
        type: "user",
        level: "read",
        target: "user_abcd",
        source: "user_5678",
      },
    ],
  }),
  mongoMapping: {
    text: {
      content_keywords: "text",
      tags: "text",
      creator: "text",
      added: "text",
      name: "text",
      company_id: "text",
    },
  },
  esMapping: {
    properties: {
      name: { type: "text", index_prefixes: { min_chars: 1 } },
      content_keywords: { type: "text", index_prefixes: { min_chars: 1 } },
      tags: { type: "keyword" },
      creator: { type: "keyword" },
      added: { type: "keyword" },
      company_id: { type: "keyword" },
    },
  },
};
