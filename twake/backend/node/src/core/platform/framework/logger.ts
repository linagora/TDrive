import pino from "pino";
import { Configuration } from "./configuration";

const config = new Configuration("logger");

export type TdriveLogger = pino.Logger;

export const logger = pino({
  name: "TdriveApp",
  level: config.get("level", "info") || "info",
  prettyPrint:
    process.env.NODE_ENV?.indexOf("test") > -1
      ? {
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname,name",
        }
      : false,
});

export const getLogger = (name?: string): TdriveLogger =>
  logger.child({ name: `tdrive${name ? "." + name : ""}` });
