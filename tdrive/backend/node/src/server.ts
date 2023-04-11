import * as Sentry from "@sentry/node";
import { TdrivePlatform } from "./core/platform/platform";
import config from "./core/config";
import tdrive from "./tdrive";

if (config.get("sentry.dsn")) {
  Sentry.init({
    dsn: config.get("sentry.dsn"),
    tracesSampleRate: 1.0,
  });
}

const launch = async (): Promise<TdrivePlatform> => tdrive.run(config.get("services"));

// noinspection JSIgnoredPromiseFromCall
launch();
