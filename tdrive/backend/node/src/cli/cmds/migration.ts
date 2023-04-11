import { CommandModule } from "yargs";

const command: CommandModule = {
  describe: "Migrate your php message to node",
  command: "migration <command>",
  builder: yargs =>
    yargs.commandDir("migration_cmds", {
      visit: commandModule => commandModule.default,
    }),
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  handler: () => {},
};

export default command;
