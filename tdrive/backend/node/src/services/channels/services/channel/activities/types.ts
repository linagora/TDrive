import { Channel, User } from "../../../../../utils/types";
import { ChannelMember } from "../../../../../services/channels/entities";

export type ActorType = { type: string; id: User["id"] };

export type ResourceObjectType = {
  type: string;
  resource: Channel | User | ChannelMember | [];
};

export type ContextType = {
  type: "add" | "remove" | "diff";
  array?: ResourceObjectType[];
  previous?: ResourceObjectType;
  next?: ResourceObjectType;
};

export type ActivityObjectType = {
  type: string;
  actor: ActorType;
  context: ContextType;
};

export type ActivityPublishedType = {
  channel_id: Channel["id"];
  workspace_id: Channel["workspace_id"];
  company_id: Channel["company_id"];
  activity: ActivityObjectType;
};
