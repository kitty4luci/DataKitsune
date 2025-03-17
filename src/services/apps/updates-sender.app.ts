import { Server } from "../system/server";
import { AppConfig } from "../../interfaces/app-config";
import { PostgresProvider } from "../../database/postgres-provider";
import { RedisQueue } from "../../services/redis-queue";
import { UpdatesSender } from "../../handlers/updates-sender";
import { Worker } from "../system/worker";
import { LinkRepository } from "../../repositories/link.repository";
import { TelegramNotify } from "../../services/telegram-notify";
import { TimeParserService } from "../../services/time-parser.service";
import { ScheduleService } from "../../services/schedule-service";
import { SubscriptionService } from "../../services/subscription-service";
import { ChatSubscriptionRepository } from "../../repositories/chat-subscription.repository";
import { ChatScheduleRepository } from "../../repositories/chat-schedule.repository";
import { BotStatusService } from "../../services/bot-status-service";
import { BotEventRepository } from "../../repositories/bot-event.repository";
import { UpdatePaginationRepository } from "../../repositories/update-pagination.repository";
import { Logger } from "../system/logger";
import { IWorker } from "../../interfaces/worker";
import * as Redis from "ioredis";

export async function configureUpdatesSenderApp(
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
  const queue = new RedisQueue(
    config.scheduledUpdatesQueue,
    config.redisConnectionString
  );

  const redis = new Redis.default(config.redisConnectionString, {
    retryStrategy: (times) => Math.min(times * 50, 2000),
    maxRetriesPerRequest: 3,
  });

  const chatScheduleRepo = new ChatScheduleRepository(provider);
  const chatSubscriptionRepo = new ChatSubscriptionRepository(provider);
  const subscriptionService = new SubscriptionService(chatSubscriptionRepo);
  const botEventRepo = new BotEventRepository(provider);
  const botStatusService = new BotStatusService(botEventRepo);
  const timeParser = new TimeParserService();
  const scheduleService = new ScheduleService(
    chatScheduleRepo,
    botStatusService,
    timeParser
  );
  const telegram = new TelegramNotify(config.telegramBotApiToken);
  const paginationRepo = new UpdatePaginationRepository(provider);

  const handler = new UpdatesSender(
    linkRepo,
    subscriptionService,
    scheduleService,
    timeParser,
    telegram,
    paginationRepo,
    redis
  );
  const worker = new Worker(queue, handler);

  worker.registerCleanup(async () => {
    const logger = new Logger("redis-cleanup");
    logger.info("Disconnecting Redis client");
    redis.disconnect();
  });

  activeWorkers.push(worker);
  worker.start();
  server.configure({ worker });
}
