export type EnvironmentType = {
  env_dev: boolean;
  env_dev_auth?: 'internal' | 'remote';

  api_root_url: string;
  front_root_url: string;
  websocket_url: string;

  sentry_dsn?: string | boolean;
  usetiful_token?: string;
};

export type EnvironmentVersionType = {
  version: string;
  version_detail: string;
  version_name: string;
};
