import yargs from "yargs";
import ora from "ora";
import Table from "cli-table";
import tdrive from "../../../tdrive";
import gr from "../../../services/global-resolver";
/**
 * Merge command parameters. Check the builder definition below for more details.
 */
type ListParams = {
  id: string;
};

const services = [
  "platform-services",
  "user",
  "search",
  "channels",
  "notifications",
  "database",
  "webserver",
  "message-queue",
];

const command: yargs.CommandModule<ListParams, ListParams> = {
  command: "user",
  describe: "List workspace ers",
  builder: {
    id: {
      default: "f339d54a-e833-11ea-92c3-0242ac120004",
      type: "string",
      description: "Workspace ID",
    },
  },
  handler: async argv => {
    const table = new Table({ head: ["user ID", "Date Added"], colWidths: [40, 40] });
    const spinner = ora({ text: "Retrieving workspace users" }).start();
    const platform = await tdrive.run(services);
    await gr.doInit(platform);
    const users = await gr.services.workspaces.getUsers({ workspaceId: argv.id });

    spinner.stop();
    users
      .getEntities()
      .forEach(u => table.push([u.id, new Date(u.dateAdded).toLocaleDateString()]));
    console.log(table.toString());
  },
};

export default command;
