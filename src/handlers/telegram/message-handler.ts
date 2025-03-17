import { SaveLinkDto } from "../../dtos/save-link.dto";
import { TelegramMessage } from "../../dtos/telegram-message.dto";
import { IHandler } from "../../interfaces/handler";
import { IQueue } from "../../interfaces/queue";
import { Context, NarrowedContext } from "telegraf";
import { Message, Update } from "telegraf/typings/core/types/typegram";
import { Logger } from "../../services/system/logger";

export class MessageHandler
  implements
    IHandler<NarrowedContext<Context<Update>, Update.MessageUpdate<Message>>>
{
  private readonly logger = new Logger(MessageHandler.name);

  constructor(private readonly saveLinkQueue: IQueue<SaveLinkDto>) {}

  async handle(
    data: NarrowedContext<Context<Update>, Update.MessageUpdate<Message>>
  ): Promise<void> {
    const entities = data.entities();
    const telegramMessage = new TelegramMessage(
      String(data.message.message_id),
      String(data.message.chat.id),
      String(data.message.from.id),
      data.message.from.username,
      data.text || "",
      entities
    );

    try {
      entities.forEach(async (entity) => {
        let url: string;
        if (entity.type === "url") {
          url = telegramMessage.text.slice(
            entity.offset,
            entity.offset + entity.length
          );
        } else if (entity.type === "text_link") {
          url = entity.url;
        } else return;

        const dto = new SaveLinkDto(url, "telegram", { telegramMessage });
        await this.saveLinkQueue.enqueue(dto);
        this.logger.info(
          `Enqueued URL: ${url} for chatId: ${telegramMessage.chatId}`
        );
      });
    } catch (error) {
      this.logger.error(`Could not enqueue URL`, { telegramMessage, error });
    }
  }
}
