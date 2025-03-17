import { Command } from "commander";
import { AppConfig } from "../../interfaces/app-config";
import { Server } from "./server";
import { IWorker } from "../../interfaces/worker";
import { Logger } from "./logger";
import { ConfigManager } from "../../config/config-manager";

import { configureTelegramListenerApp } from "../apps/telegram-listener.app";
import { configureLinksApp } from "../apps/links-saver.app";
import { configureContentParserApp } from "../apps/content-parser.app";
import { configureDescriptionWriterApp } from "../apps/description-writer.app";
import { configureR2rInjectorApp } from "../apps/r2r-injector.app";
import { configureScheduleUpdatesJob } from "../apps/schedule-updates.job";
import { configureUpdatesSenderApp } from "../apps/updates-sender.app";
import { configureFinalizerApp } from "../apps/finalizer.app";

export class Application {
  private workers: IWorker<any>[] = [];
  private server: Server | null = null;

  private readonly config: AppConfig;
  private readonly logger: Logger;

  constructor() {
    this.config = ConfigManager.getConfig();
    Logger.initialize(this.config, {
      pretty: process.env.NODE_ENV === "development",
      level: process.env.NODE_ENV === "development" ? "debug" : "info",
    });

    this.logger = new Logger(Application.name);

    process.on("SIGINT", this.shutdown.bind(this));
    process.on("SIGTERM", this.shutdown.bind(this));

    this.setupGlobalErrorHandlers();
  }

  async start(): Promise<void> {
    const program = new Command()
      .version("0.0.1")
      .option("-m, --mode <mode>", "Application mode")
      .option("-t, --type <type>", "Application type")
      .parse(process.argv);

    const options = program.opts();
    const server = new Server(this.config.appPort, this.config.appPrefix);
    this.server = server;

    this.logger.info("Starting app", {
      mode: options.mode || this.config.appMode,
      type: options.type || "",
    });

    const mode = options.mode || this.config.appMode;

    switch (mode) {
      case "telegram-listener":
        await configureTelegramListenerApp(server, this.config, this.workers);
        break;
      case "links-saver":
        await configureLinksApp(server, this.config, this.workers);
        break;
      case "content-parser":
        await configureContentParserApp(server, this.config, this.workers);
        break;
      case "description-writer":
        await configureDescriptionWriterApp(server, this.config, this.workers);
        break;
      case "r2r-injector":
        await configureR2rInjectorApp(server, this.config, this.workers);
        break;
      case "schedule-updates":
        await configureScheduleUpdatesJob(this.config);
        break;
      case "updates-sender":
        await configureUpdatesSenderApp(server, this.config, this.workers);
        break;
      case "finalizer":
        await configureFinalizerApp(server, this.config, this.workers);
        break;
      default:
        this.logger.error("Unknown mode", { mode });
        process.exit(1);
    }

    if (options.type && options.type === "job") {
      this.logger.info("Running as job, exiting now");
      process.exit(0);
    }

    server.launch();
  }

  private setupGlobalErrorHandlers(): void {
    process.on("uncaughtException", (error) => {
      try {
        const logger = new Logger("uncaughtException");
        logger.fatal("Uncaught exception detected", {
          error: error.message,
          stack: error.stack,
        });
      } catch (loggerError) {
        console.error("FATAL: Uncaught exception", error);
      }
      process.exit(1);
    });

    process.on("unhandledRejection", (reason, promise) => {
      try {
        const logger = new Logger("main");
        logger.fatal("Unhandled promise rejection", {
          reason: reason instanceof Error ? reason.message : String(reason),
          stack: reason instanceof Error ? reason.stack : undefined,
        });
      } catch (loggerError) {
        console.error("FATAL: Unhandled promise rejection", reason);
      }
      process.exit(1);
    });
  }

  async shutdown(): Promise<void> {
    const logger = new Logger("shutdown");
    logger.warn("Shutting down application");

    if (this.workers.length > 0) {
      logger.warn("Stopping workers", { count: this.workers.length });
      await Promise.all(this.workers.map((w) => w.stop()));
      logger.warn("Workers stopped");
    }

    if (this.server) {
      logger.warn("Stopping server");
      await this.server.shutdown();
      logger.warn("Server stopped");
    }

    logger.info("Graceful shutdown complete");
    process.exit(0);
  }
}
