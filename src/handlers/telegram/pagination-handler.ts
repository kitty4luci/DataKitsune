import { Context } from "telegraf";
import { IHandler } from "../../interfaces/handler";
import { Logger } from "../../services/system/logger";
import { UpdatePaginationRepository } from "../../repositories/update-pagination.repository";
import { TelegramNotify } from "../../services/telegram-notify";
import { UriService } from "../../services/uri-service";

export class PaginationHandler implements IHandler<Context> {
  private readonly logger = new Logger(PaginationHandler.name);

  constructor(
    private readonly paginationRepo: UpdatePaginationRepository,
    private readonly telegramNotify: TelegramNotify
  ) {}

  async handle(context: Context): Promise<void> {
    try {
      if (!context.callbackQuery || !("data" in context.callbackQuery)) {
        return;
      }

      const data = context.callbackQuery.data as string;
      const message = context.callbackQuery.message;

      if (!message) {
        return;
      }

      // Check if it's a pagination action
      if (!data.startsWith("prev_page:") && !data.startsWith("next_page:")) {
        return;
      }

      const page = parseInt(data.split(":")[1], 10);

      // Find the pagination data for this message
      const pagination = await this.paginationRepo.getByMessageId(
        message.message_id.toString()
      );

      if (!pagination) {
        await context.answerCbQuery("This pagination has expired");
        return;
      }

      // Update current page in database
      await this.paginationRepo.updatePage(pagination.id, page);

      // Get chat link
      const chatLink = UriService.formatTelegramChatLink(pagination.chatId);

      // Update the message with new page
      await this.telegramNotify.updatePaginatedMessage(
        pagination.userId,
        message.message_id,
        chatLink,
        pagination.links,
        page,
        pagination.totalPages
      );

      // Answer callback query to remove loading state
      await context.answerCbQuery();
    } catch (error) {
      this.logger.error("Error handling pagination action", { error });
      await context.answerCbQuery("An error occurred. Please try again.");
    }
  }
}
