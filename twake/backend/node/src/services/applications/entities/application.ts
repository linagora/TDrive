import { Type } from "class-transformer";
import _, { merge } from "lodash";
import { Column, Entity } from "../../../core/platform/services/database/services/orm/decorators";
import search from "./application.search";

export const TYPE = "applications";

@Entity(TYPE, {
  primaryKey: ["id"],
  type: TYPE,
  search,
})
export default class Application {
  @Type(() => String)
  @Column("id", "timeuuid", { generator: "timeuuid" })
  id: string;

  @Type(() => String)
  @Column("group_id", "timeuuid")
  company_id: string;

  @Column("is_default", "boolean")
  is_default: boolean;

  @Column("identity", "json")
  identity: ApplicationIdentity;

  //This information is private to the application, make sure not to disclose it
  @Column("api", "encoded_json")
  api: ApplicationApi;

  @Column("access", "json")
  access: ApplicationAccess;

  @Column("display", "json")
  display: ApplicationDisplay;

  @Column("publication", "json")
  publication: ApplicationPublication;

  @Column("stats", "json")
  stats: ApplicationStatistics;

  getPublicObject(): PublicApplicationObject {
    const i = _.pick(
      this,
      "id",
      "company_id",
      "is_default",
      "identity",
      "access",
      "display",
      "publication",
      "stats",
    );

    i.is_default = !!i.is_default;
    return i;
  }

  getApplicationObject(): ApplicationObject {
    const i = _.pick(
      this,
      "id",
      "company_id",
      "is_default",
      "identity",
      "access",
      "display",
      "publication",
      "stats",
      "api",
    );

    i.is_default = !!i.is_default;
    return i;
  }
}

export type PublicApplicationObject = Pick<
  Application,
  "id" | "company_id" | "is_default" | "identity" | "access" | "display" | "publication" | "stats"
>;

export type ApplicationObject = Pick<
  Application,
  | "id"
  | "company_id"
  | "is_default"
  | "identity"
  | "access"
  | "display"
  | "publication"
  | "stats"
  | "api"
>;

export type ApplicationPrimaryKey = { id: string };

export function getInstance(message: Application): Application {
  return merge(new Application(), message);
}

export type ApplicationIdentity = {
  code: string;
  name: string;
  icon: string;
  description: string;
  website: string;
  categories: string[];
  compatibility: "twake"[];
  repository?: string;
};

export type ApplicationPublication = {
  published: boolean; //Publication accepted // RO
  requested: boolean; //Publication requested
};

export type ApplicationStatistics = {
  created_at: number; // RO
  updated_at: number; // RO
  version: number; // RO
};

export type ApplicationApi = {
  hooks_url: string;
  allowed_ips: string;
  private_key: string; // RO
};

type ApplicationScopes =
  | "files"
  | "applications"
  | "workspaces"
  | "users"
  | "messages"
  | "channels";

export type ApplicationAccess = {
  read: ApplicationScopes[];
  write: ApplicationScopes[];
  delete: ApplicationScopes[];
  hooks: ApplicationScopes[];
};

export type ApplicationDisplay = {
  twake: {
    files?: {
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
      actions?: //List of action that can apply on a file
      {
        name: string;
        id: string;
      }[];
    };

    //Chat plugin
    chat?: {
      input?:
        | true
        | {
            icon?: string; //If defined replace original icon url of your app
            type?: "file" | "call"; //To add in existing apps folder / default icon
          };
      commands?: {
        command: string; // my_app mycommand
        description: string;
      }[];
      actions?: //List of action that can apply on a message
      {
        name: string;
        id: string;
      }[];
    };

    //Allow app to appear as a bot user in direct chat
    direct?:
      | true
      | {
          name?: string;
          icon?: string; //If defined replace original icon url of your app
        };

    //Display app as a standalone application in a tab
    tab?:
      | {
          url: string;
        }
      | true;

    //Display app as a standalone application on the left bar
    standalone?:
      | {
          url: string;
        }
      | true;

    //Define where the app can be configured from
    configuration?: ("global" | "channel")[];
  };
};
