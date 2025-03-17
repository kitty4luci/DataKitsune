import { Server } from "../system/server";
import { AppConfig } from "../../interfaces/app-config";
import { RedisQueue } from "../../services/redis-queue";
import { Worker } from "../system/worker";
import { FinalizerHandler } from "../../handlers/finalizer-handler";
import { IWorker } from "../../interfaces/worker";

export async function configureFinalizerApp(
  server: Server,
  config: AppConfig,
  activeWorkers: IWorker<any>[]
): Promise<void> {
  const queue = new RedisQueue(
    config.finalizerQueue,
    config.redisConnectionString
  );

  const handler = new FinalizerHandler(config.telegramBotApiToken);
  const worker = new Worker(queue, handler);

  activeWorkers.push(worker);
  worker.start();
  server.configure({ worker });
}
