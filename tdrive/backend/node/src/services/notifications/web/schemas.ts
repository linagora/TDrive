const notificationPreferencesSchema = {
  type: "object",
  properties: {
    preferences: {
      type: "object",
      properties: {
        highlight_words: { type: "array" },
        night_break: {
          type: "object",
          properties: {
            enable: { type: "boolean" },
            from: { type: "number" },
            to: { type: "number" },
          },
        },
        private_message_content: { type: "boolean" },
        mobile_notifications: { type: "string" },
        email_notifications_delay: { type: "number" },
        deactivate_notifications_until: { type: "number" },
        notification_sound: { type: "string" },
      },
    },
  },
};

export const createNotificationPreferencesSchema = {
  body: {
    type: "object",
    properties: {
      resource: notificationPreferencesSchema,
    },
    required: ["resource"],
  },
  response: {
    201: {
      type: "object",
      properties: {
        resource: notificationPreferencesSchema,
      },
      required: ["resource"],
    },
  },
};
