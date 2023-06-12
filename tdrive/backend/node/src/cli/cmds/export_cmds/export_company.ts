import yargs from "yargs";
import tdrive from "../../../tdrive";
import { mkdirSync, writeFileSync } from "fs";
import { Pagination } from "../../../core/platform/framework/api/crud-service";
import WorkspaceUser from "../../../services/workspaces/entities/workspace_user";
import { formatCompany } from "../../../services/user/utils";
import gr from "../../../services/global-resolver";
import { formatUser } from "../../../utils/users";

/**
 * Merge command parameters. Check the builder definition below for more details.
 */
type CLIArgs = {
  id: string;
};

const services = [
  "auth",
  "storage",
  "counter",
  "message-queue",
  "user",
  "files",
  "messages",
  "workspaces",
  "platform-services",
  "console",
  "applications",
  "search",
  "database",
  "webserver",
  "channels",
  "statistics",
];

const command: yargs.CommandModule<unknown, CLIArgs> = {
  command: "company",
  describe:
    "command to export everything inside a company (publicly data only available to a new member)",
  builder: {
    id: {
      default: "",
      type: "string",
      description: "Company ID",
    },
    output: {
      default: "",
      type: "string",
      description: "Folder containing the exported data",
    },
  },
  handler: async argv => {
    const platform = await tdrive.run(services);
    await gr.doInit(platform);

    const company = await gr.services.companies.getCompany({ id: argv.id });

    if (!company) {
      return "No such company";
    }

    console.log(`Start export for company ${company.id}`);

    const output = (argv.output as string) || `export-${company.id}`;
    mkdirSync(output, { recursive: true });

    //Company
    console.log("- Create company json file");
    writeFileSync(`${output}/company.json`, JSON.stringify(formatCompany(company)));

    //Workspaces
    console.log("- Create workspaces json file");
    const workspaces = await gr.services.workspaces.getAllForCompany(company.id);
    writeFileSync(`${output}/workspaces.json`, JSON.stringify(workspaces));

    //Users
    console.log("- Create users json file");
    const users = [];
    for (const workspace of workspaces) {
      const workspace_users = [];
      let workspaceUsers: WorkspaceUser[] = [];
      let pagination = new Pagination();
      do {
        const res = await gr.services.workspaces.getUsers(
          { workspaceId: workspace.id },
          pagination,
        );
        workspaceUsers = [...workspaceUsers, ...res.getEntities()];
        pagination = res.nextPage as Pagination;
      } while (pagination.page_token);
      for (const workspaceUser of workspaceUsers) {
        const user = await gr.services.users.get({ id: workspaceUser.userId });
        if (user) {
          users.push(await formatUser(user));
          workspace_users.push({ ...workspaceUser, user });
        }
      }
      mkdirSync(`${output}/workspaces/${workspace.id}`, { recursive: true });
      writeFileSync(
        `${output}/workspaces/${workspace.id}/users.json`,
        JSON.stringify(workspace_users),
      );
    }
    writeFileSync(`${output}/users.json`, JSON.stringify(users));

    await platform.stop();
  },
};

export default command;
