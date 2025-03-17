import { Context } from "telegraf";
import { IHandler } from "../../interfaces/handler";
import { CommandContextExtn } from "telegraf/typings/telegram-types";
import { LinkRepository } from "../../repositories/link.repository";
import { Logger } from "../../services/system/logger";
import { SubscriptionService } from "../../services/subscription-service";
import { TelegramNotify } from "../../services/telegram-notify";
import { UriService } from "../../services/uri-service";
import { LinkWithDescription, Messenger } from "../../dtos/messenger.type";
import { UpdatePaginationRepository } from "../../repositories/update-pagination.repository";

export class SummaryCommandHandler
  implements
    IHandler<Context<{ message: any; update_id: number }> & CommandContextExtn>
{
  private readonly logger: Logger = new Logger(SummaryCommandHandler.name);
  private readonly PAGE_SIZE = 5;

  constructor(
    private readonly linksRepo: LinkRepository,
    private readonly subscriptionService: SubscriptionService,
    private readonly telegram: TelegramNotify,
    private readonly paginationRepo: UpdatePaginationRepository
  ) {}

  async handle(
    ctx: Context<{ message: any; update_id: number }> & CommandContextExtn
  ): Promise<void> {
    const userId = ctx.from.id.toString();

    try {
      const subscribedChatIds =
        await this.subscriptionService.getSubscribedContextIds(
          "telegram",
          userId
        );

      if (subscribedChatIds.length === 0) {
        await ctx.reply(
          "You are not subscribed to any chats. Use /subscribe in a group chat to start receiving updates.",
          {
            reply_parameters: {
              message_id: ctx.message.message_id,
            },
          }
        );
        return;
      }

      this.logger.info("User requested summary", {
        userId,
        messenger: "telegram",
        chatIds: subscribedChatIds,
      });

      let totalLinksCount = 0;

      for (const chatId of subscribedChatIds) {
        const links = await this.linksRepo.getLastLinks(
          "telegram" as Messenger,
          chatId
        );

        if (links.length === 0) {
          this.logger.info("No links to send for user from chat", {
            userId,
            messenger: "telegram",
            chatId,
          });
          continue;
        }

        totalLinksCount += links.length;

        try {
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

          this.logger.info("Summary ready for user", {
            userId,
            messenger: "telegram",
            chatId,
            linksCount: linksWithDescriptions.length,
          });

          const totalPages = Math.ceil(
            linksWithDescriptions.length / this.PAGE_SIZE
          );

          // Send paginated message
          const result = await this.telegram.sendPaginatedLinks(
            userId,
            chatLink,
            linksWithDescriptions,
            1, // Start with page 1
            totalPages
          );

          // Store pagination data for later navigation
          await this.paginationRepo.createPagination(
            "telegram",
            userId,
            chatId,
            result.messageId.toString(),
            linksWithDescriptions
          );

          this.logger.info("Sent paginated chat links summary to user", {
            userId,
            messenger: "telegram",
            chatId,
            messageId: result.messageId,
            totalPages,
          });
        } catch (error) {
          this.logger.error("Error sending chat links summary to user", {
            chatId,
            userId,
            messenger: "telegram",
            error,
          });
        }
      }

      if (totalLinksCount === 0) {
        await ctx.reply(
          "No links found in your subscribed chats in the last 24 hours.",
          {
            reply_parameters: {
              message_id: ctx.message.message_id,
            },
          }
        );
      }
    } catch (error) {
      this.logger.error("Error handling summary command", {
        userId,
        error,
      });

      await ctx.reply(`❌ Error generating summary: ${error.message}`, {
        reply_parameters: {
          message_id: ctx.message.message_id,
        },
      });
    }
  }
}
