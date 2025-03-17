import { Server } from "../system/server";
import { AppConfig } from "../../interfaces/app-config";
import { RedisQueue } from "../../services/redis-queue";
import { PostgresProvider } from "../../database/postgres-provider";
import { r2rClient as r2r } from "r2r-js";
import { SearchService } from "../../services/search-service";
import { BotStatusService } from "../../services/bot-status-service";
import { ScheduleService } from "../../services/schedule-service";
import { SubscriptionService } from "../../services/subscription-service";
import { TimeParserService } from "../../services/time-parser.service";
import { TelegramNotify } from "../../services/telegram-notify";
import { R2rCollectionMapRepository } from "../../repositories/r2r-collection-map.repository";
import { SearchStatsRepository } from "../../repositories/search-stats.repository";
import { LinkRepository } from "../../repositories/link.repository";
import { BotEventRepository } from "../../repositories/bot-event.repository";
import { ChatScheduleRepository } from "../../repositories/chat-schedule.repository";
import { ChatSubscriptionRepository } from "../../repositories/chat-subscription.repository";
import { UpdatePaginationRepository } from "../../repositories/update-pagination.repository";
import { TelegramBot } from "../../services/telegram-bot";
import { IWorker } from "../../interfaces/worker";

import {
  MessageHandler,
  StartCommandHandler,
  HelpCommandHandler,
  SearchCommandHandler,
  StatsCommandHandler,
  ScheduleCommandHandler,
  UnscheduleCommandHandler,
  SubscribeCommandHandler,
  UnsubscribeCommandHandler,
  ChatMemberStatusHandler,
  PaginationHandler,
  SummaryCommandHandler,
} from "../../handlers/telegram";

export async function configureTelegramListenerApp(
  server: Server,
  config: AppConfig,
  activeWorkers?: IWorker<any>[]
): Promise<void> {
  const provider = await PostgresProvider.getConnection(
    config.postgresHost,
    config.postgresPort,
    config.postgresUser,
    config.postgresPassword,
    config.postgresDb
  );

  const saveLinkQueue = new RedisQueue(
    config.saveLinkQueue,
    config.redisConnectionString
  );

  const r2rRepo = new R2rCollectionMapRepository(provider);
  const searchStatsRepo = new SearchStatsRepository(
    provider.getRepository("search_stats")
  );
  const botEventRepo = new BotEventRepository(provider);
  const chatScheduleRepo = new ChatScheduleRepository(provider);
  const linkRepo = new LinkRepository(provider);
  const chatSubscriptionRepo = new ChatSubscriptionRepository(provider);
  const paginationRepo = new UpdatePaginationRepository(provider);

  const r2rClient = new r2r(config.r2rBaseUrl, null, {
    enableAutoRefresh: true,
  });
  await r2rClient.users.login({
    email: config.r2rUser,
    password: config.r2rPassword,
  });

  const searchService = new SearchService(r2rClient, r2rRepo, searchStatsRepo);
  const botStatusService = new BotStatusService(botEventRepo);
  const timeParser = new TimeParserService();
  const scheduleService = new ScheduleService(
    chatScheduleRepo,
    botStatusService,
    timeParser
  );
  const subscriptionService = new SubscriptionService(chatSubscriptionRepo);
  const telegram = new TelegramNotify(config.telegramBotApiToken);

  const messagesHandler = new MessageHandler(saveLinkQueue);
  const startCommandHandler = new StartCommandHandler();
  const helpCommandHandler = new HelpCommandHandler();
  const searchCommandHandler = new SearchCommandHandler(searchService);
  const statsCommandHandler = new StatsCommandHandler(linkRepo);
  const scheduleCommandHandler = new ScheduleCommandHandler(scheduleService);
  const unscheduleCommandHandler = new UnscheduleCommandHandler(
    scheduleService
  );
  const subscribeCommandHandler = new SubscribeCommandHandler(
    scheduleService,
    subscriptionService,
    config.telegramBotUsername
  );
  const unsubscribeCommandHandler = new UnsubscribeCommandHandler(
    subscriptionService
  );
  const chatMemberStatusHandler = new ChatMemberStatusHandler(botStatusService);
  const summaryCommandHandler = new SummaryCommandHandler(
    linkRepo,
    subscriptionService,
    telegram,
    paginationRepo
  );
  const paginationHandler = new PaginationHandler(paginationRepo, telegram);

  const bot = new TelegramBot(
    messagesHandler,
    startCommandHandler,
    helpCommandHandler,
    searchCommandHandler,
    statsCommandHandler,
    scheduleCommandHandler,
    unscheduleCommandHandler,
    subscribeCommandHandler,
    unsubscribeCommandHandler,
    summaryCommandHandler,
    chatMemberStatusHandler,
    paginationHandler,
    config.telegramBotApiToken,
    config.telegramBotWebhookDomain,
    config.telegramBotWebhookPath
  );

  const middleware = await bot.createWebhook();
  server.configure({ middleware });
}
