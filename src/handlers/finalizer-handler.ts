import { FinalNotificationDto } from "../dtos/final-notification.dto";
import { IHandler } from "../interfaces/handler";
import { Logger } from "../services/system/logger";
import { TelegramNotify } from "../services/telegram-notify";
import { UriService } from "../services/uri-service";

export class FinalizerHandler implements IHandler<FinalNotificationDto> {
  private readonly logger: Logger = new Logger(FinalizerHandler.name);
  private readonly telegram: TelegramNotify;
  private readonly MAX_MESSAGE_LENGTH = 4000; // Buffer for safety (Telegram limit is 4096)

  constructor(telegramBotToken: string) {
    this.telegram = new TelegramNotify(telegramBotToken);
  }

  /**
   * Truncates a message if it exceeds the maximum length, adding a "read more" link
   * @param message The original message text
   * @param url The URL to link to for "read more"
   * @param userId Optional user ID for logging
   * @returns The truncated message with a "read more" link if needed
   */
  private truncateMessageIfNeeded(
    message: string,
    url: string,
    userId?: string
  ): string {
    if (message.length <= this.MAX_MESSAGE_LENGTH) {
      return message;
    }

    this.logger.info("Message too long, truncating", {
      userId,
      originalLength: message.length,
      limit: this.MAX_MESSAGE_LENGTH,
    });

    // Find a good truncation point (end of a sentence)
    let truncationPoint = message.lastIndexOf(
      ".",
      this.MAX_MESSAGE_LENGTH - 100
    );
    if (
      truncationPoint === -1 ||
      truncationPoint < this.MAX_MESSAGE_LENGTH * 0.75
    ) {
      // If no good sentence break, try other punctuation
      truncationPoint = message.lastIndexOf("!", this.MAX_MESSAGE_LENGTH - 100);
      if (
        truncationPoint === -1 ||
        truncationPoint < this.MAX_MESSAGE_LENGTH * 0.75
      ) {
        truncationPoint = message.lastIndexOf(
          "?",
          this.MAX_MESSAGE_LENGTH - 100
        );
        if (
          truncationPoint === -1 ||
          truncationPoint < this.MAX_MESSAGE_LENGTH * 0.75
        ) {
          // If still no good break, try line break
          truncationPoint = message.lastIndexOf(
            "\n",
            this.MAX_MESSAGE_LENGTH - 100
          );
          if (
            truncationPoint === -1 ||
            truncationPoint < this.MAX_MESSAGE_LENGTH * 0.75
          ) {
            // Last resort: just cut at a safe length
            truncationPoint = this.MAX_MESSAGE_LENGTH - 100;
          }
        }
      }
    }

    // Add 1 to include the punctuation mark or line break
    return (
      message.substring(0, truncationPoint + 1) +
      ` ... <a href="${url}">read more</a>`
    );
  }

  async handle(data: FinalNotificationDto): Promise<void> {
    switch (data.source) {
      case "r2r-injector":
        try {
          // For r2r-injector, we validate if contextId equals messages authorId
          if (
            data.messenger === "telegram" &&
            data.telegramMessage &&
            data.injection &&
            data.telegramMessage.userId === data.telegramMessage.chatId &&
            data.link &&
            data.description
          ) {
            // Extract required data
            const userId = data.telegramMessage.userId;
            const linkUrl = data.link.url;
            let messageText: string;

            // Check if it's a YouTube URL and content exists
            if (
              UriService.isYouTubeUrl(linkUrl) &&
              data.content &&
              data.content.content
            ) {
              messageText = data.content.content;
              this.logger.info("Using content for YouTube URL", {
                userId,
                linkUrl,
                hasContent: !!data.content,
              });
            } else {
              // Use description for non-YouTube URLs
              messageText = data.description.description;
            }

            // Truncate message if needed using the encapsulated method
            messageText = this.truncateMessageIfNeeded(
              messageText,
              linkUrl,
              userId
            );

            await this.telegram.sendNoPreview(userId, messageText, {
              replyToMessageId: Number(data.telegramMessage.id),
            });

            this.logger.info("Sent r2r injection notification to user", {
              userId,
              documentId: data.injection.documentId,
              isYouTube: UriService.isYouTubeUrl(linkUrl),
              contentSource:
                UriService.isYouTubeUrl(linkUrl) && data.content
                  ? "content"
                  : "description",
            });
          }
        } catch (error) {
          this.logger.error("Failed to process r2r-injector notification", {
            error: error.message,
            data,
          });
        }
        break;
      case "links-saver":
      case "content-parser":
      case "description-writer":
      default:
        this.logger.error(
          `Pipeline for message finished with error: ${data.source}`,
          { data }
        );
        break;
    }
  }
}
