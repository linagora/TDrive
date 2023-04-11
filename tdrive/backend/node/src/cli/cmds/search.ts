import { CommandModule } from "yargs";

const command: CommandModule = {
  describe: "Work with search middleware",
  command: "search <command>",
  builder: yargs =>
    yargs.commandDir("search_cmds", {
      visit: commandModule => commandModule.default,
    }),
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  handler: () => {},
};

export default command;
