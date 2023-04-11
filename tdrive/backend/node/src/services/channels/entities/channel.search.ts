import { Channel } from "./channel";

export default {
  index: "channels",
  source: (entity: Channel) => {
    return {
      workspace_id: entity.workspace_id,
      company_id: entity.company_id,
      name: entity.channel_group + " " + entity.name,
    };
  },
  mongoMapping: {
    text: {
      name: "text",
    },
  },
  esMapping: {
    properties: {
      name: { type: "text", index_prefixes: { min_chars: 1 } },
      workspace_id: { type: "keyword" },
      company_id: { type: "keyword" },
    },
  },
};
