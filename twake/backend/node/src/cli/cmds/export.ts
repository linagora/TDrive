import { CommandModule } from "yargs";

const command: CommandModule = {
  describe: "Export Tdrive data",
  command: "export <command>",
  builder: yargs =>
    yargs.commandDir("export_cmds", {
      visit: commandModule => commandModule.default,
    }),
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  handler: () => {},
};

export default command;
