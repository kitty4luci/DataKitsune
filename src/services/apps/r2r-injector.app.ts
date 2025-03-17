import { Server } from "../system/server";
import { AppConfig } from "../../interfaces/app-config";
import { RedisQueue } from "../../services/redis-queue";
import { Worker } from "../system/worker";
import { PostgresProvider } from "../../database/postgres-provider";
import { R2rCollectionMapRepository } from "../../repositories/r2r-collection-map.repository";
import { R2rHandler } from "../../handlers/r2r-handler";
import { r2rClient as r2r } from "r2r-js";
import { IWorker } from "../../interfaces/worker";

export async function configureR2rInjectorApp(
  server: Server,
  config: AppConfig,
  activeWorkers: IWorker<any>[]
): Promise<void> {
  const provider = await PostgresProvider.getConnection(
    config.postgresHost,
    config.postgresPort,
    config.postgresUser,
    config.postgresPassword,
    config.postgresDb
  );

  const r2rRepo = new R2rCollectionMapRepository(provider);

  const r2rInjectorQueue = new RedisQueue(
    config.r2rInjectorQueue,
    config.redisConnectionString
  );

  // Create finalizer queue for sending notifications
  const finalizerQueue = new RedisQueue(
    config.finalizerQueue,
    config.redisConnectionString
  );

  const r2rClient = new r2r(config.r2rBaseUrl, null, {
    enableAutoRefresh: true,
  });

  await r2rClient.users.login({
    email: config.r2rUser,
    password: config.r2rPassword,
  });

  const worker = new Worker(
    r2rInjectorQueue,
    new R2rHandler(r2rClient, r2rRepo, finalizerQueue)
  );

  activeWorkers.push(worker);
  worker.start();
  server.configure({ worker });
}
