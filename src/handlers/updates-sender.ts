import { UriService } from "../services/uri-service";
import { LinkWithDescription, Messenger } from "../dtos/messenger.type";
import { SendUpdateDto } from "../dtos/send-update.dto";
import { IHandler } from "../interfaces/handler";
import { LinkRepository } from "../repositories/link.repository";
import { TelegramNotify } from "../services/telegram-notify";
import { Logger } from "../services/system/logger";
import { SubscriptionService } from "../services/subscription-service";
import { ScheduleService } from "../services/schedule-service";
import { TimeParserService } from "src/services/time-parser.service";
import { UpdatePaginationRepository } from "../repositories/update-pagination.repository";
import { Redis } from "ioredis";

export class UpdatesSender implements IHandler<SendUpdateDto> {
  private readonly logger = new Logger(UpdatesSender.name);
  private readonly PAGE_SIZE = 5;
  private readonly CACHE_TTL = 660; // 11 minutes in seconds

  constructor(
    private readonly linksRepo: LinkRepository,
    private readonly subscriptionService: SubscriptionService,
    private readonly scheduleService: ScheduleService,
    private readonly timeParser: TimeParserService,
    private readonly telegram: TelegramNotify,
    private readonly paginationRepo: UpdatePaginationRepository,
    private readonly redis: Redis
  ) {}

  async handle(data: SendUpdateDto): Promise<void> {
    this.logger.info("Preparing update for user", {
      userId: data.userId,
      messenger: data.messenger,
    });

    // Check if this user was recently updated using Redis cache
    const cacheKey = `update_sent:${data.messenger}:${data.userId}`;
    const wasRecentlyUpdated = await this.redis.get(cacheKey);

    if (wasRecentlyUpdated) {
      this.logger.info("Skipping update - user was recently updated", {
        userId: data.userId,
        messenger: data.messenger,
      });
      return;
    }

    const schedule = await this.scheduleService.getSchedule(
      data.messenger,
      data.userId
    );

    if (!schedule) {
      this.logger.warn("No schedule found for user", {
        userId: data.userId,
        messenger: data.messenger,
      });
      return;
    }

    if (!schedule.enabled) {
      this.logger.info("Schedule is disabled for user", {
        userId: data.userId,
        messenger: data.messenger,
      });
      return;
    }

    const scheduleLocalHour =
      (schedule.hour - schedule.timezoneOffset + 24) % 24;

    const now = new Date();
    if (
      this.timeParser.isTimeMatching(
        now.getUTCHours(),
        now.getUTCMinutes(),
        scheduleLocalHour,
        schedule.minute
      )
    ) {
      const subscribedChatIds =
        await this.subscriptionService.getSubscribedContextIds(
          data.messenger,
          data.userId
        );

      this.logger.info("User has subscribed chats", {
        userId: data.userId,
        messenger: data.messenger,
        chatIds: subscribedChatIds,
      });

      // Flag to track if any updates were sent
      let updatesSent = false;

      for (const chatId of subscribedChatIds) {
        const links = await this.linksRepo.getLastLinks(
          data.messenger as Messenger,
          chatId
        );

        if (links.length === 0) {
          this.logger.info("There is no links to send for user from chat", {
            userId: data.userId,
            messenger: data.messenger,
            chatId,
          });
          continue;
        } else {
          try {
            if (data.messenger === "telegram") {
              const chatLink = UriService.formatTelegramChatLink(chatId);

              const linksWithDescriptions: LinkWithDescription[] = links.map(
                (l) => {
                  const hasDescription = l.description?.description;
                  return {
                    url: l.url,
                    description: hasDescription
                      ? l.description.description
                      : undefined,
                  };
                }
              );

              this.logger.info("Report ready for user", {
                userId: data.userId,
                messenger: data.messenger,
                chatId,
                linksCount: linksWithDescriptions.length,
              });

              const totalPages = Math.ceil(
                linksWithDescriptions.length / this.PAGE_SIZE
              );

              // Send paginated message
              const result = await this.telegram.sendPaginatedLinks(
                data.userId,
                chatLink,
                linksWithDescriptions,
                1, // Start with page 1
                totalPages
              );

              // Store pagination data for later navigation
              await this.paginationRepo.createPagination(
                data.messenger,
                data.userId,
                chatId,
                result.messageId.toString(),
                linksWithDescriptions
              );

              this.logger.info("Sent paginated chat links update to user", {
                userId: data.userId,
                messenger: data.messenger,
                chatId,
                messageId: result.messageId,
                totalPages,
              });

              // Mark that we sent at least one update
              updatesSent = true;
            } else {
              this.logger.warn("No handler for messenger", {
                messenger: data.messenger,
              });
            }
          } catch (error) {
            this.logger.error("Error sending chat links update to user", {
              chatId,
              userId: data.userId,
              messenger: data.messenger,
              error,
            });
          }
        }
      }

      // If any updates were sent to the user, set cache to prevent duplicate updates for 11 minutes
      if (updatesSent) {
        const cacheKey = `update_sent:${data.messenger}:${data.userId}`;
        await this.redis.set(cacheKey, "true", "EX", this.CACHE_TTL);
        this.logger.debug("Set update cache for user", {
          userId: data.userId,
          messenger: data.messenger,
          ttl: this.CACHE_TTL,
        });
      }
    }
  }
}
