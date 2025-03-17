import { LinkEntity } from "../entities/link.entity";
import { BaseDto } from "./base.dto";
import { ContentEntity } from "../entities/content.entity";
import { DescriptionEntity } from "../entities/description.entity";
import { Messenger } from "./messenger.type";
import { TelegramMessage } from "./telegram-message.dto";
import { DiscordMessage } from "./discord-message.dto";

export class InjectR2rDto extends BaseDto {
  link: LinkEntity;
  content: ContentEntity;
  description: DescriptionEntity;

  constructor(
    link: LinkEntity,
    content: ContentEntity,
    description: DescriptionEntity,
    messenger: Messenger,
    opts?: {
      telegramMessage?: TelegramMessage;
      discordMessage?: DiscordMessage;
    }
  ) {
    super(messenger, opts);
    this.link = link;
    this.content = content;
    this.description = description;
  }
}
