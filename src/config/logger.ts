import pino from "pino";
import { env } from "./env.js";

const pretty = env.LOG_PRETTY && env.NODE_ENV !== "production";

export const logger = pino(
  pretty
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
        level: "debug",
      }
    : {
        level: env.NODE_ENV === "production" ? "info" : "debug",
      }
);
