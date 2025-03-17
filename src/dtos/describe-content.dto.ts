import { ContentEntity } from "src/entities/content.entity";
import { BaseDto } from "./base.dto";
import { DiscordMessage } from "./discord-message.dto";
import { Messenger } from "./messenger.type";
import { TelegramMessage } from "./telegram-message.dto";
import { LinkEntity } from "src/entities/link.entity";

export class DescribeContentDto extends BaseDto {
  link: LinkEntity;
  content: ContentEntity;

  constructor(
    link: LinkEntity,
    content: ContentEntity,
    messenger: Messenger,
    opts?: {
      telegramMessage?: TelegramMessage;
      discordMessage?: DiscordMessage;
    }
  ) {
    super(messenger, opts);
    this.content = content;
    this.link = link;
  }
}
