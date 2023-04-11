/* eslint-disable @typescript-eslint/no-explicit-any */
import Logger from 'app/features/global/framework/logger-service';
import Observable from 'app/deprecated/Observable/Observable';
import Api from 'app/features/global/framework/api-service';
import { getCompany } from 'app/features/companies/state/companies';
import WorkspaceService from 'app/deprecated/workspaces/workspaces.jsx';

export type ConsoleConfiguration = {
  authority: string;
  client_id: string;
  max_unverified_days: number;
  account_management_url: string;
  company_subscription_url: string;
  company_management_url: string;
  collaborators_management_url: string;
};

export type InternalConfiguration = {
  disable_account_creation: boolean;
  disable_email_verification: boolean;
};

export type ServerInfoType = null | {
  status: 'ready';
  version: {
    current: string;
    minimal: {
      web: string;
      mobile: string;
    };
  };
  branding?: {
    logo: string;
  };
  auth: Array<string>;
  configuration: {
    branding: any;
    help_url: string | null;
    pricing_plan_url: string | null;
    app_download_url: string | null;
    app_grid: { logo: string; name: string; url: string }[];
    mobile: {
      mobile_redirect: string;
      mobile_appstore: string;
      mobile_googleplay: string;
    };
    accounts: {
      type: 'remote' | 'internal';
      remote?: ConsoleConfiguration;
      internal?: InternalConfiguration;
    };
  };
};

class InitService extends Observable {
  public server_infos: ServerInfoType = null;
  public server_infos_loaded = false;
  public app_ready = false;
  private logger = Logger.getLogger('InitService');

  getConsoleLink(
    link:
      | 'account_management_url'
      | 'company_management_url'
      | 'collaborators_management_url'
      | 'company_subscription_url',
    companyId?: string,
  ) {
    companyId = companyId || WorkspaceService.currentGroupId;
    const identity_provider_id =
      getCompany(companyId || '')?.identity_provider_id || getCompany(companyId || '')?.id;
    return (this.server_infos?.configuration?.accounts?.remote?.[link] || '').replace(
      /\{company_id\}/gm,
      identity_provider_id,
    );
  }

  async getServer() {
    return await Api.get<ServerInfoType>('/internal/services/general/v1/server', undefined, false, {
      disableJWTAuthentication: true,
    });
  }

  async init() {
    this.server_infos = await this.getServer();

    if (this.server_infos?.status !== 'ready') {
      this.logger.debug('Server is not ready', this.server_infos);
      this.app_ready = false;
      this.notify();
      setTimeout(() => {
        this.init();
      }, 1000);
    } else {
      this.logger.debug('Server is ready', this.server_infos);
      this.server_infos_loaded = true;
      this.app_ready = true;
      this.notify();
    }
  }
}

export default new InitService();
