import Company from "../../../../services/user/entities/company";
import { Channel } from "../../../../services/channels/entities";
import { TdriveServiceProvider } from "../../framework";
import { KnowledgeGraphGenericEventPayload } from "./types";
import Workspace from "../../../../services/workspaces/entities/workspace";
import User from "../../../../services/user/entities/user";

export default interface KnowledgeGraphAPI extends TdriveServiceProvider {
  onCompanyCreated(data: KnowledgeGraphGenericEventPayload<Company>): void;
  onWorkspaceCreated(data: KnowledgeGraphGenericEventPayload<Workspace>): void;
  onChannelCreated(data: KnowledgeGraphGenericEventPayload<Channel>): void;
  onUserCreated(data: KnowledgeGraphGenericEventPayload<User>): void;
}
