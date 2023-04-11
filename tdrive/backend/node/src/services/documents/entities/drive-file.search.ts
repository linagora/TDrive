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
