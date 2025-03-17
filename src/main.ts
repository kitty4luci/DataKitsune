import * as dotenv from "dotenv";
import { Logger } from "./services/system/logger";
import { Application } from "./services/system/application";

dotenv.config();

new Application().start().catch((error) => {
  try {
    const logger = new Logger("main");
    logger.fatal("Application startup failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  } catch (loggerError) {
    console.error("Application startup failed", error);
  }
  process.exit(1);
});
