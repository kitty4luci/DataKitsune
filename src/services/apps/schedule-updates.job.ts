import { AppConfig } from "../../interfaces/app-config";
import { PostgresProvider } from "../../database/postgres-provider";
import { RedisQueue } from "../redis-queue";
import { SendUpdateDto } from "../../dtos/send-update.dto";
import { BotEventRepository } from "../../repositories/bot-event.repository";
import { BotStatusService } from "../bot-status-service";
import { ChatSubscriptionRepository } from "../../repositories/chat-subscription.repository";
import { SubscriptionService } from "../subscription-service";
import { Logger } from "../system/logger";

export async function configureScheduleUpdatesJob(
  config: AppConfig
): Promise<void> {
  const logger = new Logger("schedule-updates");
  const provider = await PostgresProvider.getConnection(
    config.postgresHost,
    config.postgresPort,
    config.postgresUser,
    config.postgresPassword,
    config.postgresDb
  );

  const chatSubscriptionRepo = new ChatSubscriptionRepository(provider);
  const botEventRepo = new BotEventRepository(provider);
  const subscriptionService = new SubscriptionService(chatSubscriptionRepo);
  const botStatusService = new BotStatusService(botEventRepo);

  const queue = new RedisQueue(
    config.scheduledUpdatesQueue,
    config.redisConnectionString
  );

  const subscribers: Set<string> = new Set();

  const chatIds = await botStatusService.getActiveChats();
  if (chatIds.length === 0) {
    logger.info("No active chats found");
    return;
  }

  logger.info("Active chats", { count: chatIds.length });
  for (const chatId of chatIds) {
    try {
      logger.debug("Getting chat subscribers", { chatId });
      const subscriptions = await subscriptionService.getSubscribedActors(
        "telegram",
        chatId
      );
      subscriptions.map((sub) => subscribers.add(sub.actorId));
    } catch (error) {
      logger.error("Error occurred while getting chat subscribers", {
        chatId,
        error,
      });
      return;
    }
  }

  if (subscribers.size > 0) {
    logger.info("Sending updates to subscribers", { count: subscribers.size });
    subscribers.forEach(async (subscriberId) => {
      try {
        await queue.enqueue(new SendUpdateDto("telegram", subscriberId));
      } catch (error) {
        logger.error("Error occurred while enqueuing update for user", {
          subscriberId,
          error,
        });
      }
    });
  } else {
    logger.info("No subscribers found");
  }
}
