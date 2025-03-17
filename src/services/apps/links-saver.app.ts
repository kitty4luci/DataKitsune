import { Server } from "../system/server";
import { AppConfig } from "../../interfaces/app-config";
import { RedisQueue } from "../../services/redis-queue";
import { Worker } from "../system/worker";
import { PostgresProvider } from "../../database/postgres-provider";
import { LinkRepository } from "../../repositories/link.repository";
import { LinksHandler } from "../../handlers/links-handler";
import { IWorker } from "../../interfaces/worker";

export async function configureLinksApp(
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

  const linkRepo = new LinkRepository(provider);

  const saveLinkQueue = new RedisQueue(
    config.saveLinkQueue,
    config.redisConnectionString
  );

  const parseContentQueue = new RedisQueue(
    config.parseContentQueue,
    config.redisConnectionString
  );

  const worker = new Worker(
    saveLinkQueue,
    new LinksHandler(linkRepo, parseContentQueue)
  );

  activeWorkers.push(worker);
  worker.start();
  server.configure({ worker });
}
