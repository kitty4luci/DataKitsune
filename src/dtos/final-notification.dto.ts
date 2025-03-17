import { LinkEntity } from "src/entities/link.entity";
import { BaseDto } from "./base.dto";
import { DiscordMessage } from "./discord-message.dto";
import { Messenger } from "./messenger.type";
import { TelegramMessage } from "./telegram-message.dto";
import { ContentEntity } from "src/entities/content.entity";
import { DescriptionEntity } from "src/entities/description.entity";

export class FinalNotificationDto extends BaseDto {
  source: string;
  link?: LinkEntity;
  content?: ContentEntity;
  description?: DescriptionEntity;
  injection?: { collectionId: string; documentId?: string };

  constructor(
    source: string,
    messenger: Messenger,
    opts?: {
      telegramMessage?: TelegramMessage;
      discordMessage?: DiscordMessage;
      link?: LinkEntity;
      content?: ContentEntity;
      description?: DescriptionEntity;
      index?: { collectionId: string; documentId?: string };
    }
  ) {
    super(messenger, opts);
    this.source = source;
    this.link = opts?.link;
    this.content = opts?.content;
    this.description = opts?.description;
    this.injection = opts?.index;
  }
}
