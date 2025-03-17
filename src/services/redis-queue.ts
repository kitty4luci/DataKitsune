import { Redis } from "ioredis";
import { IQueue } from "../interfaces/queue";
import { Logger } from "./system/logger";

export class RedisQueue<T> implements IQueue<T> {
  private client: Redis;
  private readonly name: string;
  private readonly processingTimeout: number;
  private readonly logger = new Logger(RedisQueue.name);

  constructor(
    name: string,
    connectionString: string,
    options?: { processingTimeout?: number }
  ) {
    this.client = new Redis(connectionString, {
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: 3,
    });
    this.name = name;
    this.processingTimeout = options?.processingTimeout || 30;
  }

  async enqueue<T>(message: T): Promise<void> {
    try {
      const serializedMessage = JSON.stringify(message);
      await this.client.lpush(this.name, serializedMessage);
      this.logger.debug("Message enqueued", { queue: this.name });
    } catch (error) {
      this.logger.error("Failed to enqueue message", {
        queue: this.name,
        error,
      });
      throw new Error("Failed to enqueue message");
    }
  }

  async dequeue<T>(): Promise<T | null> {
    try {
      const processingName = `${this.name}_processing`;
      const results = await this.client
        .multi()
        .brpoplpush(this.name, processingName, 0)
        .expire(processingName, this.processingTimeout)
        .exec();

      if (!results || results.length < 2) {
        this.logger.error("Dequeue error: invalid operations results", {
          queue: this.name,
          resultsLength: results?.length,
        });
        return null;
      }

      const [moveResult, expireResult] = results;
      const [moveError, message] = moveResult;
      const [expireError] = expireResult;

      if (moveError || expireError || !message) {
        if (moveError || expireError) {
          this.logger.error("Redis operation errors", {
            moveError,
            expireError,
            queue: this.name,
          });
        }
        return null;
      }

      if (typeof message !== "string") {
        this.logger.error("Dequeue error: invalid message type", {
          queue: this.name,
          messageType: typeof message,
        });
        return null;
      }

      const parsedMessage = JSON.parse(message) as T;
      await this.client.lrem(processingName, 1, message);
      this.logger.debug("Message dequeued", { queue: this.name });

      return parsedMessage;
    } catch (error) {
      this.logger.error("Dequeue error", { queue: this.name, error });
      return null;
    }
  }

  async disconnect() {
    this.logger.info("Disconnecting from Redis", { queue: this.name });
    this.client.disconnect();
    this.client.quit();
  }
}
