import pino from "pino";
import { AppConfig } from "../../interfaces/app-config";

interface LoggerOptions {
  level?: string;
  component?: string;
  pretty?: boolean;
}

export class Logger {
  private static instance: pino.Logger;
  private static config: AppConfig;
  private logger: pino.Logger;

  public static initialize(
    config: AppConfig,
    options: LoggerOptions = {}
  ): void {
    const appMode = config.appMode || "unknown";

    const logLevel = options.level || "debug";
    const pretty = options.pretty || process.env.NODE_ENV !== "production";

    const defaultOptions: pino.LoggerOptions = {
      level: logLevel,
      base: {
        component: options.component || appMode,
        service: "deta-kitsune",
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      formatters: {
        level: (label) => {
          return { level: label };
        },
      },
      transport: pretty
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "SYS:standard",
              ignore: "pid,hostname",
            },
          }
        : undefined,
    };

    Logger.instance = pino(defaultOptions);
    Logger.config = config;
  }

  public static getInstance(): pino.Logger {
    if (!Logger.instance) {
      throw new Error(
        "Logger not initialized. Call Logger.initialize() first."
      );
    }
    return Logger.instance;
  }

  constructor(context: string, additionalBindings: Record<string, any> = {}) {
    if (!Logger.instance) {
      throw new Error(
        "Logger not initialized. Call Logger.initialize() first."
      );
    }

    this.logger = Logger.instance.child({
      context,
      ...additionalBindings,
    });
  }

  trace(msg: string, obj: Record<string, any> = {}): void {
    this.logger.trace(obj, msg);
  }

  debug(msg: string, obj: Record<string, any> = {}): void {
    this.logger.debug(obj, msg);
  }

  info(msg: string, obj: Record<string, any> = {}): void {
    this.logger.info(obj, msg);
  }

  warn(msg: string, obj: Record<string, any> = {}): void {
    this.logger.warn(obj, msg);
  }

  error(msg: string, obj: Record<string, any> = {}): void {
    this.logger.error(obj, msg);
  }

  fatal(msg: string, obj: Record<string, any> = {}): void {
    this.logger.fatal(obj, msg);
  }

  dump(obj: any, msg: string = "Object dump"): void {
    this.logger.debug({ objDump: obj }, msg);
  }
}
