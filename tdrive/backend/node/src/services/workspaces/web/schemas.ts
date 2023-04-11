import { webSocketSchema } from "../../../utils/types";
import { companyObjectSchema, userObjectSchema } from "../../user/web/schemas";

const workspaceObjectSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    company_id: { type: "string" },
    name: { type: "string" },
    logo: { type: "string" },
    default: { type: "boolean" },
    archived: { type: "boolean" },
    stats: {
      type: "object",
      properties: {
        created_at: { type: "number" },
        total_members: { type: "number" },
      },
    },
    role: { type: "string", enum: ["moderator", "member"] },
    preferences: {
      type: ["object", "null"],
      properties: {
        invite_domain: {
          type: ["string", "null"],
        },
      },
    },
  },
};

export const getWorkspacesSchema = {
  response: {
    "2xx": {
      type: "object",
      properties: {
        resources: { type: "array", items: workspaceObjectSchema },
        websockets: { type: "array", items: webSocketSchema },
      },
      required: ["resources"],
    },
  },
};

export const getWorkspaceSchema = {
  response: {
    "2xx": {
      type: "object",
      properties: {
        resource: workspaceObjectSchema,
      },
      required: ["resource"],
    },
  },
};

export const createWorkspaceSchema = {
  body: {
    type: "object",
    properties: {
      resource: {
        type: "object",
        properties: {
          name: { type: "string" },
          logo: { type: "string" },
          default: { type: "boolean" },
        },
        required: ["name", "logo", "default"],
      },
      options: {
        type: "object",
        properties: {
          logo_b64: { type: "string" },
        },
      },
    },
    required: ["resource"],
  },
  response: {
    "2xx": {
      type: "object",
      properties: {
        resource: workspaceObjectSchema,
      },
      required: ["resource"],
    },
  },
};

export const updateWorkspaceSchema = {
  body: {
    type: "object",
    properties: {
      resource: {
        type: "object",
        properties: {
          name: { type: "string" },
          logo: { type: "string" },
          default: { type: "boolean" },
          archived: { type: "boolean" },
        },
      },
      options: {
        type: "object",
        properties: {
          logo_b64: { type: "string" },
        },
      },
    },
    required: ["resource"],
  },
  response: {
    "2xx": {
      type: "object",
      properties: {
        resource: workspaceObjectSchema,
      },
      required: ["resource"],
    },
  },
};

export const deleteWorkspaceSchema = {
  response: {
    "2xx": {
      type: "object",
      properties: {
        resource: workspaceObjectSchema,
      },
      required: ["resource"],
    },
  },
};

const workspaceUserObjectSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    company_id: { type: "string" },
    workspace_id: { type: "string" },
    user_id: { type: "string" },
    created_at: { type: "number" },
    role: { type: "string", enum: ["moderator", "member"] },
    user: userObjectSchema,
  },
};

export const getWorkspaceUsersSchema = {
  response: {
    "2xx": {
      type: "object",
      properties: {
        resources: { type: "array", items: workspaceUserObjectSchema },
        next_page_token: { type: "string" },
      },
      required: ["resources"],
    },
  },
};

export const getWorkspaceUserSchema = {
  response: {
    "2xx": {
      type: "object",
      properties: {
        resource: workspaceUserObjectSchema,
      },
      required: ["resource"],
    },
  },
};

export const createWorkspaceUserSchema = {
  body: {
    type: "object",
    properties: {
      resource: {
        type: "object",
        properties: {
          user_id: { type: "string" },
          role: { type: "string", enum: ["moderator", "member"] },
        },
        required: ["user_id", "role"],
      },
    },
    required: ["resource"],
  },
  response: {
    "2xx": {
      type: "object",
      properties: {
        resource: workspaceUserObjectSchema,
      },
      required: ["resource"],
    },
  },
};

export const updateWorkspaceUserSchema = {
  body: {
    type: "object",
    properties: {
      resource: {
        type: "object",
        properties: {
          role: { type: "string", enum: ["moderator", "member"] },
        },
        required: ["role"],
      },
    },
    required: ["resource"],
  },
  response: {
    "2xx": {
      type: "object",
      properties: {
        resource: workspaceUserObjectSchema,
      },
      required: ["resource"],
    },
  },
};

export const deleteWorkspaceUserSchema = {
  response: {
    "2xx": {
      type: "object",
      // properties: {
      //   resource: workspaceObjectSchema,
      // },
      // required: ["resource"],
    },
  },
};

export const inviteWorkspaceUserSchema = {
  body: {
    type: "object",
    properties: {
      invitations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            email: { type: "string" },
            role: { type: "string", enum: ["moderator", "member"] },
            company_role: { type: "string", enum: ["owner", "admin", "member", "guest"] },
          },
          required: ["email", "role", "company_role"],
        },
      },
      channels: {
        type: "array",
        items: {
          type: "string",
        },
      },
    },
    required: ["invitations"],
  },
};

export const getWorkspacePendingUsersSchema = {
  response: {
    "2xx": {
      type: "object",
      properties: {
        resources: {
          type: "array",
          items: {
            type: "object",
            properties: {
              email: { type: "string" },
              role: { type: "string", enum: ["moderator", "member"] },
              company_role: { type: "string", enum: ["owner", "admin", "member", "guest"] },
            },
            required: ["email", "role", "company_role"],
          },
        },
      },
      required: ["resources"],
    },
  },
};

export const deleteWorkspacePendingUsersSchema = {
  response: {
    "204": {},
  },
};

const workspaceInviteTokenObjectSchema = {
  type: "object",
  properties: {
    token: { type: "string" },
  },
};

export const getWorkspaceInviteTokenSchema = {
  response: {
    "2xx": {
      type: "object",
      properties: {
        resources: { type: "array", items: workspaceInviteTokenObjectSchema },
      },
      required: ["resources"],
    },
  },
};

export const postWorkspaceInviteTokenSchema = {
  body: {
    type: "object",
    properties: {
      channels: {
        type: "array",
        items: {
          type: "string",
        },
      },
    },
    required: ["channels"],
  },
  response: {
    "2xx": {
      type: "object",
      properties: {
        resource: workspaceInviteTokenObjectSchema,
      },
      required: ["resource"],
    },
  },
};

export const deleteWorkspaceInviteTokenSchema = {
  response: {
    "204": {},
  },
};

export const joinInviteTokenSchema = {
  body: {
    type: "object",
    properties: {
      join: { type: "boolean" },
      token: { type: "string" },
    },
    required: ["join", "token"],
  },
  response: {
    "2xx": {
      type: "object",
      properties: {
        resource: {
          type: "object",
          properties: {
            company: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                plan: companyObjectSchema["properties"]["plan"],
                stats: companyObjectSchema["properties"]["stats"],
              },
            },
            workspace: {
              type: "object",
              properties: { id: { type: "string" }, name: { type: "string" } },
            },
            auth_required: { type: "boolean" },
          },
        },
      },
    },
  },
};
