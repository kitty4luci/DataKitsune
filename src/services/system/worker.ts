import { IWorker } from "../../interfaces/worker";
import { IQueue } from "../../interfaces/queue";
import { IHandler } from "../../interfaces/handler";
import { Logger } from "./logger";

export class Worker<T> implements IWorker<T> {
  private isRunning: boolean = false;
  private readonly logger: Logger;
  private cleanupHandler?: () => Promise<void>;

  constructor(
    private readonly queue: IQueue<T>,
    private readonly handler: IHandler<T>,
    private readonly pollingInterval: number = 100
  ) {
    this.logger = new Logger(Worker.name);
  }

  /**
   * Register a cleanup handler to be called when the worker stops
   */
  registerCleanup(handler: () => Promise<void>): void {
    this.cleanupHandler = handler;
  }

  async start(): Promise<void> {
    this.isRunning = true;
    this.logger.info("Worker started");

    while (this.isRunning) {
      try {
        const data = await this.queue.dequeue();
        if (data) await this.handler.handle(data);
        else
          await new Promise((resolve) =>
            setTimeout(resolve, this.pollingInterval)
          );
      } catch (error) {
        this.logger.error("Worker caught error during processing", {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    }
  }

  async stop(): Promise<void> {
    this.isRunning = false;

    if (this.cleanupHandler) {
      try {
        await this.cleanupHandler();
        this.logger.info("Worker cleanup completed");
      } catch (error) {
        this.logger.error("Worker cleanup error", {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    }

    this.logger.info("Worker stopped");
  }

  state(): { running: boolean } {
    return { running: this.isRunning };
  }
}
