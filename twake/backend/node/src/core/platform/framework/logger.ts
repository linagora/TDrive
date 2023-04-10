import pino from "pino";
import { Configuration } from "./configuration";

const config = new Configuration("logger");

export type TwakeLogger = pino.Logger;

export const logger = pino({
  name: "TwakeApp",
  level: config.get("level", "info") || "info",
  prettyPrint: false,
});

export const getLogger = (name?: string): TwakeLogger =>
  logger.child({ name: `twake${name ? "." + name : ""}` });
