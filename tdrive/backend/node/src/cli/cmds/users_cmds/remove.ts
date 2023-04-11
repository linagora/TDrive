import yargs from "yargs";
import ora from "ora";
import tdrive from "../../../tdrive";
import Table from "cli-table";
import { exit } from "process";
import gr from "../../../services/global-resolver";

/**
 * Merge command parameters. Check the builder definition below for more details.
 */
type CLIArgs = {
  id: string;
};

const services = [
  "storage",
  "counter",
  "message-queue",
  "platform-services",
  "user",
  "search",
  "database",
  "webserver",
  "statistics",
  "applications",
  "auth",
  "realtime",
  "websocket",
];

const command: yargs.CommandModule<unknown, CLIArgs> = {
  command: "remove",
  describe: "command that allow you to remove one user",
  builder: {
    id: {
      default: "",
      type: "string",
      description: "User ID",
    },
  },
  handler: async argv => {
    const tableBefore = new Table({
      head: ["User ID", "Username", "Deleted"],
      colWidths: [40, 40, 10],
    });
    const tableAfter = new Table({
      head: ["User ID", "Username", "Deleted"],
      colWidths: [40, 40, 10],
    });
    const spinner = ora({ text: "Retrieving user" }).start();

    const platform = await tdrive.run(services);
    await gr.doInit(platform);

    const user = await gr.services.users.get({ id: argv.id });

    if (!user) {
      console.error("Error: You need to provide User ID");
      return spinner.stop();
    }

    if (user) {
      // Table before
      tableBefore.push([user.id, user.username_canonical, user.deleted]);

      await gr.services.users.anonymizeAndDelete(
        { id: user.id },
        {
          user: { id: user.id, server_request: true },
        },
      );

      const finalUser = await gr.services.users.get({ id: argv.id });

      // Table after
      tableAfter.push([finalUser.id, finalUser.username_canonical, finalUser.deleted]);

      spinner.stop();
    }

    exit();
  },
};

export default command;
