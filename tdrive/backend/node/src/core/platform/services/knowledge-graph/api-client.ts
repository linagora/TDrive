import axios, { AxiosInstance } from "axios";

import { KnowledgeGraphCreateBodyRequest, KnowledgeGraphCreateMessageObjectData } from "./types";

import { md5 } from "../../../../core/crypto";
import { Channel } from "../../../../services/channels/entities";
import gr from "../../../../services/global-resolver";
import Company from "../../../../services/user/entities/company";
import User from "../../../../services/user/entities/user";
import Workspace from "../../../../services/workspaces/entities/workspace";
import { getLogger, TdriveLogger } from "../../framework";

export default class KnowledgeGraphAPIClient {
  protected readonly version = "1.0.0";
  protected readonly axiosInstance: AxiosInstance = axios.create();
  readonly apiUrl: string;
  readonly logger: TdriveLogger = getLogger("knowledge-graph-api-client");

  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  private async getUserKGId(id: string, provider_id?: string) {
    provider_id = provider_id || (await gr.services.users.get({ id }))?.identity_provider_id;
    return provider_id;
  }

  private async getUserKGMailId(id: string, email?: string) {
    email = email || (await gr.services.users.get({ id }))?.email_canonical;
    return md5(email.trim().toLocaleLowerCase());
  }

  private async getCompanyKGId(id: string, identity_provider_id?: string) {
    identity_provider_id =
      identity_provider_id ||
      (await gr.services.companies.getCompany({ id }))?.identity_provider_id ||
      id;
    return identity_provider_id;
  }

  public async onCompanyCreated(company: Partial<Company>): Promise<void> {
    this.send({
      records: [
        {
          key: "null",
          value: {
            id: "Company",
            properties: {
              _kg_company_id: await this.getCompanyKGId(company.id, company.identity_provider_id),
              company_id: company.id,
              company_name: company.displayName || company.name,
            },
          },
        },
      ],
    });
  }

  public async onWorkspaceCreated(workspace: Partial<Workspace>): Promise<void> {
    const response = await this.send({
      records: [
        {
          key: "null",
          value: {
            id: "Workspace",
            properties: {
              _kg_company_id: await this.getCompanyKGId(workspace.company_id),
              company_id: workspace.company_id,
              workspace_name: workspace.name,
              workspace_id: workspace.id,
            },
          },
        },
      ],
    });

    if (response.statusText === "OK") {
      this.logger.info("onWorkspaceCreated %o", response.config.data);
    }
  }

  public async onUserCreated(companyId: string, user: Partial<User>): Promise<void> {
    const response = await this.send({
      records: [
        {
          key: "null",
          value: {
            id: "User",
            properties: {
              _kg_user_id: await this.getUserKGId(user.id, user.identity_provider_id),
              _kg_email_id: await this.getUserKGMailId(user.id, user.email_canonical),
              _kg_company_all_id: await Promise.all(
                user.cache.companies.map(async c => await this.getCompanyKGId(c)),
              ),
              user_id: user.id,
              email: user.email_canonical,
              username: user.username_canonical,
              user_last_activity: user.last_activity,
              first_name: user.first_name,
              user_created_at: user.creation_date,
              last_name: user.last_name,
              company_id: companyId,
            },
          },
        },
      ],
    });

    if (response.statusText === "OK") {
      this.logger.info("onUserCreated %o", response.config.data);
    }
  }

  public async onChannelCreated(channel: Partial<Channel>): Promise<void> {
    const response = await this.send({
      records: [
        {
          key: "null",
          value: {
            id: "Channel",
            properties: {
              _kg_user_id: await this.getUserKGId(channel.owner),
              _kg_email_id: await this.getUserKGMailId(channel.owner),
              _kg_company_id: await this.getCompanyKGId(channel.company_id),
              channel_id: channel.id,
              channel_name: channel.name,
              channel_owner: channel.owner,
              workspace_id: channel.workspace_id,
              company_id: channel.company_id,
            },
          },
        },
      ],
    });

    if (response.statusText === "OK") {
      this.logger.info("onChannelCreated %o", response.config.data);
    }
  }

  private async send(data: any) {
    return await this.axiosInstance.post<
      KnowledgeGraphCreateBodyRequest<KnowledgeGraphCreateMessageObjectData[]>
    >(`${this.apiUrl}/topics/tdrive`, data, {
      headers: {
        "Content-Type": "application/vnd.kafka.json.v2+json",
        Accept: "application/vnd.kafka.v2+json",
      },
    });
  }
}
