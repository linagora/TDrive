import { ConsoleRemoteClient } from "./clients/remote";
import { ConsoleServiceClient } from "./client-interface";
import { ConsoleType } from "./types";
import { ConsoleInternalClient } from "./clients/internal";
import { ConsoleServiceImpl } from "./service";

class StaticConsoleClientFactory {
  create(consoleInstance: ConsoleServiceImpl): ConsoleServiceClient {
    const type: ConsoleType = consoleInstance.consoleType;
    switch (type) {
      case "remote":
        return new ConsoleRemoteClient(consoleInstance);
      case "internal":
        return new ConsoleInternalClient(consoleInstance);
      default:
        throw new Error(`${type} is not supported`);
    }
  }
}

export const ConsoleClientFactory = new StaticConsoleClientFactory();
