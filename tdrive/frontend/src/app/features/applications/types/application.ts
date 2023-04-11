/**
 * DEPRECATED
 * We should remove this when we are sure that new application format is implemented everywhere in Tdrive
 */
export type AppType = { [key: string]: unknown };

export type PluginAction = {
  name: string;
  id: string;
  description: string;
};

export type FilePlugin = {
  editor?: {
    preview_url: string; //Open a preview inline (iframe)
    edition_url: string; //Url to edit the file (full screen)
    extensions?: string[]; //Main extensions app can read
    // if file was created by the app, then the app is able to edit with or without extension
    empty_files?: {
      url: string; // "https://[...]/empty.docx";
      filename: string; // "Untitled.docx";
      name: string; // "Word Document";
    }[];
  };

  /**
   * List of action that can apply on a file
   */
  actions?: PluginAction[];
};

/**
 * @example { icon: "path/to/icon.png", type: "file" }
 */
export type ChatPluginInput = {
  /**
   * If defined replace original icon url of your app
   */
  icon: string;

  /**
   * To add in existing apps folder / default icon
   */
  type: 'file' | 'call';
};

/**
 * @example { command: "my_command_name", description: "My command description" }
 * @usage my_app_name my_command_name
 */
export type ChatPluginCommand = {
  /**
   * Name of the command
   */
  command: string;

  /**
   * Description of the command
   */
  description: string;
};

/**
 * Direct plugin object
 * Chat plugin object
 */
export type ChatPlugin = {
  input?: ChatPluginInput;

  /**
   * List of commands that can apply on a message
   */
  commands?: ChatPluginCommand[];

  /**
   * List of action that can apply on a message
   */
  actions?: PluginAction[];
};

/**
 * Direct plugin object
 * Allow app to appear as a bot user in direct chat
 * @example { name: "My app bot"}
 */
export type DirectPlugin = {
  /**
   * User bot name
   */
  name: string;

  /**
   * If defined replace original icon url of your app
   */
  icon: string;
};

/**
 * Display app as a standalone application in a tab
 */
export type TabPlugin = {
  url: string;
};

/**
 * Standalone plugin object
 * Display app as a standalone application on the left bar
 */
export type StandalonePlugin = {
  url: string;
};

export type ApplicationDisplay = {
  tdrive?: {
    version?: number;

    /**
     * File plugin object
     */
    files?: FilePlugin;

    /**
     * Chat plugin object
     */
    chat?: ChatPlugin;

    /**
     * Direct plugin object
     * Allow app to appear as a bot user in direct chat
     */
    direct?: DirectPlugin;

    /**
     * Tab plugin object
     * Display app as a standalone application in a tab
     */
    tab?: TabPlugin;

    /**
     * Standalone plugin object
     * Display app as a standalone application on the left bar
     */
    standalone?: StandalonePlugin;

    /**
     * Define where the app can be configured from
     * @example ['global', 'channel']
     */
    configuration?: string[];
  };
};
export type ApplicationScopes =
  | 'files'
  | 'applications'
  | 'workspaces'
  | 'users'
  | 'messages'
  | 'channels';

export type ApplicationAccess = {
  delete: ApplicationScopes[];
  hooks: ApplicationScopes[];
  read: ApplicationScopes[];
  write: ApplicationScopes[];
};

export type ApplicationIdentity = {
  code: string;
  name: string;
  icon?: string;
  description?: string;
  website?: string;
  categories: string[];
  compatibility: string[];
};

type ApplicationPublication = {
  published?: boolean;
  requested?: boolean;
  pending?: boolean;
};

type ApplicationApi = {
  hooks_url?: string;
  allowed_ips?: string;
  private_key?: string;
};

type ApplicationStatistics = {
  created_at: number;
  updated_at: number;
  version: number;
};

export type Application = {
  id: string;
  company_id: string;
  access: ApplicationAccess;
  display: ApplicationDisplay;
  identity: ApplicationIdentity;
  publication: ApplicationPublication;
  stats: ApplicationStatistics;
  api?: ApplicationApi;
};
