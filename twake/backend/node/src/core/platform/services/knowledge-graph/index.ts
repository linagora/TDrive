import { Configuration, Consumes, getLogger, TdriveLogger, TdriveService } from "../../framework";
import { localEventBus } from "../../framework/event-bus";
import KnowledgeGraphAPI from "./provider";
import Workspace from "../../../../services/workspaces/entities/workspace";
import Company from "../../../../services/user/entities/company";
import User from "../../../../services/user/entities/user";
import { Channel } from "../../../../services/channels/entities";
import {
  KnowledgeGraphGenericEventPayload,
  KnowledgeGraphEvents,
  KnowledgeGraphCallbackEvent,
} from "./types";
import KnowledgeGraphAPIClient from "./api-client";
import gr from "../../../../services/global-resolver";

@Consumes([])
export default class KnowledgeGraphService
  extends TdriveService<KnowledgeGraphAPI>
  implements KnowledgeGraphAPI
{
  readonly name = "knowledge-graph";
  readonly version = "1.0.0";
  protected kgAPIClient: KnowledgeGraphAPIClient = this.getKnowledgeGraphApiClient();
  logger: TdriveLogger = getLogger("knowledge-graph-service");

  async doInit(): Promise<this> {
    const use = this.getConfigurationEntry<boolean>("use");

    if (!use) {
      this.logger.warn("Knowledge graph is not used");

      return this;
    }

    localEventBus.subscribe<KnowledgeGraphGenericEventPayload<Company>>(
      KnowledgeGraphEvents.COMPANY_UPSERT,
      this.onCompanyCreated.bind(this),
    );

    localEventBus.subscribe<KnowledgeGraphGenericEventPayload<Workspace>>(
      KnowledgeGraphEvents.WORKSPACE_UPSERT,
      this.onWorkspaceCreated.bind(this),
    );

    localEventBus.subscribe<KnowledgeGraphGenericEventPayload<Channel>>(
      KnowledgeGraphEvents.CHANNEL_UPSERT,
      this.onChannelCreated.bind(this),
    );

    localEventBus.subscribe<KnowledgeGraphGenericEventPayload<User>>(
      KnowledgeGraphEvents.USER_UPSERT,
      this.onUserCreated.bind(this),
    );

    return this;
  }

  /** When the KG service send us new events */
  async onCallbackEvent(token: string, data: KnowledgeGraphCallbackEvent): Promise<void> {
    if (token === this.getConfigurationEntry<string>("callback_token")) {
      this.logger.info("Unimplemented: KnowledgeGraph - Callback event", data);
    } else {
      throw new Error("Invalid token");
    }
  }

  async onCompanyCreated(data: KnowledgeGraphGenericEventPayload<Company>): Promise<void> {
    this.logger.info(`${KnowledgeGraphEvents.COMPANY_UPSERT} %o`, data);

    if (this.kgAPIClient && (await this.shouldForwardEvent([data.resource.id]))) {
      this.kgAPIClient.onCompanyCreated(data.resource);
    }
  }

  async onWorkspaceCreated(data: KnowledgeGraphGenericEventPayload<Workspace>): Promise<void> {
    this.logger.info(`${KnowledgeGraphEvents.WORKSPACE_UPSERT} %o`, data);

    if (this.kgAPIClient && (await this.shouldForwardEvent([data.resource.company_id]))) {
      this.kgAPIClient.onWorkspaceCreated(data.resource);
    }
  }

  async onChannelCreated(data: KnowledgeGraphGenericEventPayload<Channel>): Promise<void> {
    this.logger.info(`${KnowledgeGraphEvents.CHANNEL_UPSERT} %o`, data);

    if (this.kgAPIClient && (await this.shouldForwardEvent([data.resource.company_id]))) {
      this.kgAPIClient.onChannelCreated(data.resource);
    }
  }

  async onUserCreated(data: KnowledgeGraphGenericEventPayload<User>): Promise<void> {
    this.logger.info(`${KnowledgeGraphEvents.USER_UPSERT} %o`, data);

    if (
      this.kgAPIClient &&
      (await this.shouldForwardEvent(data.resource.cache?.companies || [], data.resource.id))
    ) {
      for (const companyId of data.resource.cache?.companies || []) {
        this.kgAPIClient.onUserCreated(companyId, data.resource);
      }
    }
  }

  private getConfigurationEntry<T>(key: string): T {
    const configuration = new Configuration("knowledge-graph");
    return configuration.get(key);
  }

  private getKnowledgeGraphApiClient(): KnowledgeGraphAPIClient {
    const endpoint = this.getConfigurationEntry<string>("endpoint");

    if (endpoint && endpoint.length) {
      this.kgAPIClient = new KnowledgeGraphAPIClient(endpoint);
    } else {
      this.logger.info("KnowledgeGraph - No endpoint defined in default.json");
    }

    return this.kgAPIClient;
  }

  async shouldForwardEvent(
    companyIds: string[] | null,
    userId?: string,
  ): Promise<false | "all" | "metadata"> {
    const user = userId ? await gr.services.users.get({ id: userId }) : null;
    const forwardedCompanies = this.getConfigurationEntry<string[]>("forwarded_companies");
    const isCompanyForwarded = !!(companyIds || []).find(v => forwardedCompanies.includes(v));
    if (user?.preferences && !user.preferences.knowledge_graph)
      user.preferences.knowledge_graph = "metadata";
    return (!userId || (user && user.preferences?.knowledge_graph !== "nothing")) &&
      (!companyIds ||
        companyIds.length === 0 ||
        isCompanyForwarded ||
        forwardedCompanies.length === 0)
      ? user
        ? (user.preferences.knowledge_graph as "all" | "metadata")
        : "all"
      : false;
  }

  api(): KnowledgeGraphAPI {
    return this;
  }
}
