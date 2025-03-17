import express from "express";
import promClient from "prom-client";
import * as http from "http";
import { IWorker } from "src/interfaces/worker";
import { Logger } from "./logger";

export class Server {
  private server: http.Server | null = null;
  private readonly app: express.Application;
  private readonly register: promClient.Registry;
  private worker?: IWorker<any>;
  private readonly logger: Logger;

  constructor(
    private readonly port: number = 9090,
    prefix: string = "express_"
  ) {
    this.app = express();
    this.port = port;
    this.logger = new Logger("server");

    this.register = new promClient.Registry();
    promClient.collectDefaultMetrics({
      register: this.register,
      prefix,
    });
  }

  configure(opts?: {
    middleware?: (
      req: http.IncomingMessage & {
        body?: any;
      },
      res: http.ServerResponse,
      next?: () => void
    ) => Promise<void>;
    worker?: IWorker<any>;
  }): void {
    this.setupMiddlewares(opts?.middleware);
    this.setupGlobalErrorHandler();
    this.setupEndpoints(opts?.worker);
  }

  launch(): http.Server {
    this.server = this.app.listen(this.port, () => {
      this.logger.info("Server started", { port: this.port });
    });
    return this.server;
  }

  async shutdown(): Promise<void> {
    this.logger.warn("Shutting down server");
    if (this.app)
      return new Promise((resolve, reject) => {
        this.server!.close((err) => {
          if (err) {
            this.logger.error("Error shutting down server", { error: err });
            reject(err);
          } else {
            this.logger.info("Server shutdown complete");
            resolve();
          }
        });
      });
  }

  private setupMiddlewares(
    middleware?: (
      req: http.IncomingMessage & {
        body?: any;
      },
      res: http.ServerResponse,
      next?: () => void
    ) => Promise<void>
  ): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    if (middleware) this.app.use(middleware);
  }

  private setupGlobalErrorHandler(): void {
    this.app.use(
      (
        err: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        this.logger.error("Unhandled exception", {
          error: err.message,
          stack: err.stack,
          path: req.path,
          method: req.method,
        });

        if (res.headersSent) {
          return next(err);
        }

        // Return appropriate error response
        // res.status(500).json({
        //   status: 'error',
        //   message: 'An unexpected error occurred',
        //   requestId: req.headers['x-request-id'] || 'unknown',
        // });
      }
    );
  }

  private setupEndpoints(worker?: IWorker<any>): void {
    if (worker) {
      this.worker = worker;
      this.app.get("/health", (_req, res) => {
        this.worker.state().running
          ? res.status(200).json({ status: "OK" })
          : res.status(503).json({ status: "Stopped" });
      });
      this.app.on("close", () => this.worker.stop());
    } else {
      this.app.get("/health", (_req, res) => {
        res.status(200).json({ status: "OK" });
      });
    }

    this.app.get("/metrics", async (_req, res) => {
      res.setHeader("Content-Type", this.register.contentType);
      res.send(await this.register.metrics());
    });

    // Catch-all for unhandled routes
    this.app.use((req, res) => {
      this.logger.warn("Route not found", {
        path: req.path,
        method: req.method,
      });
      res.status(404).json({ status: "error", message: "Route not found" });
    });
  }
}
