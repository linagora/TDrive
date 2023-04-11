export const consoleHookSchema = {
  querystring: {
    type: "object",
    properties: {
      secret_key: { type: "string" },
    },
  },
  body: {
    type: "object",
    properties: {
      type: { type: "string" },
      content: { type: "object" },
      signature: { type: "string" },
      secret_key: { type: "string" },
    },
    required: ["type", "content"],
  },
  response: {
    "2xx": {
      type: "object",
      properties: {
        success: { type: "boolean" },
        error: { type: "string" },
      },
    },
  },
};

export const authenticationSchema = {
  body: {
    type: "object",
    properties: {
      email: { type: "string" },
      password: { type: "string" },
      oidc_id_token: { type: "string" },
    },
  },
  response: {
    "2xx": {
      type: "object",
      properties: {
        access_token: {
          type: "object",
          properties: {
            time: { type: "number" },
            expiration: { type: "number" },
            refresh_expiration: { type: "number" },
            value: { type: "string" },
            refresh: { type: "string" },
            type: { type: "string" },
          },
        },
      },
    },
  },
};

export const tokenRenewalSchema = {
  response: {
    "2xx": {
      type: "object",
      properties: {
        access_token: {
          type: "object",
          properties: {
            time: { type: "number" },
            expiration: { type: "number" },
            refresh_expiration: { type: "number" },
            value: { type: "string" },
            refresh: { type: "string" },
            type: { type: "string" },
          },
        },
      },
    },
  },
};
