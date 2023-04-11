/* eslint-disable @typescript-eslint/no-explicit-any */
export type ConfigurationType = {
  auth?: {
    internal?: {
      disable_account_creation?: any | null;
      disable_email_verification?: any | null;
      use?: boolean;
    };
    console?: {
      max_unverified_days: number;
      account_management_url: string;
      collaborators_management_url: string;
      company_subscription_url: string;
      company_management_url: string;
      use: boolean;
    };
  };
  auth_mode?: string[];
  elastic_search_available?: boolean;
  help_url?: string;
  ready?: boolean;
  version?: {
    current?: string;
    minimal?: {
      web?: string;
      mobile?: string;
    };
  };
};
