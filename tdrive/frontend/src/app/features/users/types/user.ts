/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CompanyRoleType,
  CompanyStatusType,
  CompanyType,
} from 'app/features/companies/types/company';
import { WorkspaceType } from 'app/features/workspaces/types/workspace';

export type UserPreferencesType = null | {
  locale?: string;
  timezone?: number;
  language?: string;
  allow_tracking?: boolean;
  tutorial_done?: boolean;
  channel_ordering?: 'chronological' | 'alphabetical';
  recent_workspaces?: { company_id: string; workspace_id: string }[];
  knowledge_graph?: 'all' | 'nothing' | 'metadata';
  notifications?: UserNotificationPreferences[];
};

export type UserNotificationPreferences = {
  company_id: string | 'all';
  workspace_id: string | 'all';
  preferences: {
    highlight_words?: string[];
    night_break?: {
      enable: boolean;
      from: number;
      to: number;
    };
    private_message_content?: boolean;
    mobile_notifications?: 'never' | 'when_inactive' | 'always';
    email_notifications_delay?: number; //0: never send email, 1 and more in minutes from first unread notification
    deactivate_notifications_until?: number;
    notification_sound?: 'default' | 'none' | string;
  };
};

export type UserCompanyType = {
  company: CompanyType;
  role: CompanyRoleType;
  status: CompanyStatusType;
};

export type UserWorkspaceType = Partial<WorkspaceType>;

export type UserType = {
  connected?: boolean;
  email: string;
  first_name?: string;
  front_id?: string;
  groups_id?: string[];
  id?: string;
  identity_provider?: string;
  provider_id?: string;
  provider?: string;
  last_activity?: number;
  last_seen?: number;
  is_connected?: boolean;
  isNew?: boolean;
  isRobot?: boolean;
  language?: string;
  last_name?: string;
  mail_hash?: string;
  mail_verification_override?: any;
  mail_verification_override_mail?: any;
  mails?: any;
  notifications_preferences?: any;
  status?: string;
  status_icon?: string[];
  picture?: string;
  thumbnail?: string;
  timezone_offset?: string;
  tutorial_status?: any;
  username: string;
  cache: { companies: string[] };
  companies?: UserCompanyType[];
  preferences: UserPreferencesType;
  preference?: UserPreferencesType;
  full_name?: string;
  /**
   * this field is filled when available and so we cannot rely on it except on search service for filtering
   **/
  workspaces?: UserWorkspaceType[];
  workspaces_id?: string[];
  is_verified?: boolean;
  created_at?: number;
  deleted?: boolean;
  _cached?: boolean;
  _cached_from?: any;
  _created?: boolean;
  _creating?: boolean;
  _last_modified?: any;
  _loaded?: boolean;
  _loaded_from?: any;
  _persisted?: boolean;
  _updating?: boolean;
};
