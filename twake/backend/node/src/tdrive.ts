import path from "path";
import { TdrivePlatform, TdrivePlatformConfiguration } from "./core/platform/platform";

import globalResolver from "./services/global-resolver";

/**
 * Instantiate and start a new TdrivePlatform with the given services.
 */
async function run(services: string[] = []): Promise<TdrivePlatform> {
  let platform: TdrivePlatform;

  const start = async (): Promise<TdrivePlatform> => {
    try {
      const configuration: TdrivePlatformConfiguration = {
        services,
        servicesPath: path.resolve(__dirname, "./services/"),
      };
      platform = new TdrivePlatform(configuration);
      await platform.init();
      await platform.start();
      await globalResolver.doInit(platform);
      return platform;
    } catch (err) {
      console.error("Will exit process because of: ", err);
      process.exit(-1);
    }
  };

  async function stop() {
    try {
      await platform?.stop();
    } catch (err) {
      console.error(err);
    }
  }

  process.on("uncaughtException", error => {
    console.error(error);
  });

  process.on("unhandledRejection", error => {
    console.error(error);
  });

  process.on("SIGINT", async () => {
    await stop();
    process.kill(process.pid, "SIGUSR2");
  });

  process.once("SIGUSR2", async () => {
    await stop();
    process.kill(process.pid, "SIGUSR2");
  });

  await start();

  return platform;
}

export default {
  run,
};
