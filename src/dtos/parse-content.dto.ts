import { LinkEntity } from "src/entities/link.entity";
import { Messenger } from "./messenger.type";
import { BaseDto } from "./base.dto";
import { TelegramMessage } from "./telegram-message.dto";
import { DiscordMessage } from "./discord-message.dto";

export class ParseContentDto extends BaseDto {
  link: LinkEntity;

  constructor(
    link: LinkEntity,
    messenger: Messenger,
    opts?: {
      telegramMessage?: TelegramMessage;
      discordMessage?: DiscordMessage;
    }
  ) {
    super(messenger, opts);
    this.link = link;
  }
}
