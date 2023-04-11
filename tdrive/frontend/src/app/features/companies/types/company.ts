import { FeatureValueType } from 'app/features/global/services/feature-toggles-service';

export type CompanyRoleType = 'owner' | 'admin' | 'member' | 'guest';

export type CompanyStatusType = 'active' | 'deactivated' | 'invited';

export type CompanyBillingObjectType = {
  status: 'error' | 'warning' | string;
  trial_end: number;
};

export enum CompanyLimitsEnum {
  CHAT_MESSAGE_HISTORY_LIMIT = 'chat:message_history_limit',
  COMPANY_MEMBERS_LIMIT = 'company:members_limit', // 100
  COMPANY_GUESTS_LIMIT = 'company:guests_limit'
}

export type CompanyLimitsObjectType = {
  [CompanyLimitsEnum.CHAT_MESSAGE_HISTORY_LIMIT]: number;
  [CompanyLimitsEnum.COMPANY_MEMBERS_LIMIT]: number;
  [CompanyLimitsEnum.COMPANY_GUESTS_LIMIT]: number;
};

export type CompanyStatsObjectType = {
  created_at: number;
  total_members: number;
  total_guests: number;
  total_messages: number;
  //Will be completed with Tdrive specific stats
};

export type CompanyPlanObjectType = {
  id: string;
  name: string;
  billing?: CompanyBillingObjectType;
  limits?: CompanyLimitsObjectType;
  features: { [key: string]: FeatureValueType };
};

export type CompanyType = {
  id: string; //Related to console code
  name: string;
  mininame?: string;
  logo: string;
  plan?: CompanyPlanObjectType;
  stats?: CompanyStatsObjectType;
  identity_provider_id?: string;

  //If requested as a user
  role?: CompanyRoleType;
  status?: CompanyStatusType;
};
