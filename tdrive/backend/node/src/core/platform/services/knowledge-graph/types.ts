export type KnowledgeGraphCreateCompanyObjectData = {
  key: string;
  value: {
    id: string;
    properties: {
      company_id: string;
      company_name: string;
    };
  };
};

export type KnowledgeGraphCreateWorkspaceObjectData = {
  key: string;
  value: {
    id: string;
    properties: {
      company_id: string;
      workspace_name: string;
      workspace_id: string;
    };
  };
};

export type KnowledgeGraphCreateUserObjectData = {
  key: string;
  value: {
    id: string;
    properties: {
      user_id: string;
      email: string;
      username: string;
      user_last_activity: string;
      first_name: string;
      user_created_at: string;
      last_name: string;
      company_id: string;
    };
  };
};

export type KnowledgeGraphCreateChannelObjectData = {
  key: string;
  value: {
    id: string;
    properties: {
      channel_id: string;
      channel_name: string;
      channel_owner: string;
      workspace_id: string;
    };
  };
};

export type KnowledgeGraphCreateMessageObjectData = {
  key: string;
  value: {
    id: string;
    properties: {
      message_thread_id: string;
      message_created_at: string;
      message_content: string;
      type_message: string;
      message_updated_at: string;
      user_id: string;
      channel_id: string;
    };
  };
};

export type KnowledgeGraphCreateBodyRequest<T> = {
  records: T;
};

export type KnowledgeGraphRelationLinkObject = {
  relation: "mention" | "sender" | "parent" | "children" | "owner";
  type: "user" | "channel" | "workspace" | "company" | "message";
  id: string;
};

export type KnowledgeGraphGenericEventPayload<T> = {
  id: string;
  resource: Partial<T>;
  links: KnowledgeGraphRelationLinkObject[];
};

export enum KnowledgeGraphEvents {
  COMPANY_UPSERT = "kg:company:upsert",
  WORKSPACE_UPSERT = "kg:workspace:upsert",
  CHANNEL_UPSERT = "kg:channel:upsert",
  MESSAGE_UPSERT = "kg:message:upsert",
  USER_UPSERT = "kg:user:upsert",
}

export type KnowledgeGraphCallbackEvent = {
  recipients: {
    type: "user";
    id: string; // KG user id which is a md5 of the email
  }[];
  event: {
    type: "user_tags"; //More events will be added later
    data: {
      //For user_tags event only
      tags?: {
        value: string;
        weight: number;
      }[];
    };
  };
};
