import { IHandler } from "../interfaces/handler";
import { SaveLinkDto } from "../dtos/save-link.dto";
import { LinkRepository } from "../repositories/link.repository";
import { IQueue } from "../interfaces/queue";
import { ParseContentDto } from "../dtos/parse-content.dto";
import { LinkEntity } from "../entities/link.entity";
import { Logger } from "../services/system/logger";

export class LinksHandler implements IHandler<SaveLinkDto> {
  private readonly logger = new Logger(LinksHandler.name);

  constructor(
    private readonly linkRepo: LinkRepository,
    private readonly contentQueue: IQueue<ParseContentDto>
  ) {}

  handle(data: SaveLinkDto): Promise<void> {
    switch (data.messenger) {
      case "telegram":
        return this.handleTelegram(data);

      case "discord":
      // todo
      default:
        this.logger.warn("Unknown messenger", {
          messenger: data.messenger,
          url: data.url,
        });
        break;
    }
  }

  private async handleTelegram(data: SaveLinkDto): Promise<void> {
    if (!data.telegramMessage) {
      this.logger.warn("No telegram message in data", { url: data.url });
      return;
    }

    let link: LinkEntity = null;
    try {
      link = await this.linkRepo.addLink({
        messenger: data.messenger,
        contextId: data.telegramMessage.chatId,
        messageId: data.telegramMessage.id,
        userId: data.telegramMessage.userId,
        username: data.telegramMessage.username,
        url: data.url,
        raw: data,
      });
    } catch (error) {
      this.logger.error("Failed to save link", {
        error,
        url: data.url,
        chatId: data.telegramMessage.chatId,
      });
      return;
    }

    const dto = new ParseContentDto(link, data.messenger, {
      telegramMessage: data.telegramMessage,
    });

    try {
      await this.contentQueue.enqueue(dto);
      this.logger.debug("Enqueued content for parsing", {
        linkId: link.id,
        url: link.url,
      });
    } catch (error) {
      this.logger.error("Failed to enqueue content", {
        error,
        linkId: link.id,
        url: link.url,
      });
      return;
    }
  }
}
