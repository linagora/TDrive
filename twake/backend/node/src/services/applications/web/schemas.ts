export const applicationsSchema = {
  type: "object",
  properties: {},
};

const applicationIdentity = {
  type: "object",
  properties: {
    code: { type: "string" },
    name: { type: "string" },
    icon: { type: "string" },
    description: { type: "string" },
    website: { type: "string" },
    categories: { type: "array", items: { type: "string" } },
    compatibility: { type: "array", items: { type: "string" } },
  },
  required: ["code", "name", "icon", "description", "website", "categories", "compatibility"],
};

const applicationAccess = {
  type: "object",
  properties: {
    read: { type: "array", items: { type: "string" } },
    write: { type: "array", items: { type: "string" } },
    delete: { type: "array", items: { type: "string" } },
    hooks: { type: "array", items: { type: "string" } },
  },
  required: ["read", "write", "delete", "hooks"],
};

const requestApplicationPublication = {
  type: "object",
  properties: {
    requested: { type: "boolean" },
  },
  required: ["requested"],
};

const responseApplicationPublication = {
  type: "object",
  properties: {
    published: { type: "boolean" },
    requested: { type: "boolean" },
  },
  required: ["requested", "published"],
};

const applicationStats = {
  type: "object",
  properties: {
    created_at: { type: "number" },
    updated_at: { type: "number" },
    version: { type: "number" },
  },
  required: ["created_at", "updated_at", "version"],
};

const apiObject = {
  type: "object",
  properties: {
    hooks_url: { type: "string" },
    allowed_ips: { type: "string" },
    private_key: { type: "string" },
  },
  required: ["hooks_url", "allowed_ips"],
};

const requestApplicationObject = {
  type: "object",
  properties: {
    company_id: { type: "string" },
    identity: applicationIdentity,
    access: applicationAccess,
    display: {},
    api: apiObject,
    publication: requestApplicationPublication,
  },
  required: ["company_id", "identity", "access", "display", "api", "publication"],
  additionalProperties: false,
};

const responseApplicationObject = {
  type: "object",
  properties: {
    id: { type: "string" },
    is_default: { type: "boolean" },
    company_id: { type: "string" },
    identity: applicationIdentity,
    access: applicationAccess,
    display: {},
    publication: responseApplicationPublication,
    api: apiObject,
    stats: applicationStats,
  },
  required: [
    "id",
    "is_default",
    "company_id",
    "identity",
    "access",
    "display",
    "publication",
    "stats",
  ],
  additionalProperties: false,
};

export const applicationPostSchema = {
  body: { type: "object", properties: { resource: requestApplicationObject } },
  response: {
    "2xx": {
      resource: responseApplicationObject,
    },
  },
};

export const applicationEventHookSchema = {
  body: {
    type: "object",
    properties: {
      company_id: { type: "string" },
      workspace_id: { type: "string" },
      type: { type: "string" },
      name: { type: "string" },
      content: {},
    },
    required: ["company_id", "workspace_id", "type", "content"],
  },
};
