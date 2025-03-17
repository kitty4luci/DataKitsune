import { BaseDto } from "./base.dto";
import { DiscordMessage } from "./discord-message.dto";
import { Messenger } from "./messenger.type";
import { TelegramMessage } from "./telegram-message.dto";

export class SaveLinkDto extends BaseDto {
  url: string;

  constructor(
    url: string,
    messenger: Messenger,
    opts?: {
      telegramMessage?: TelegramMessage;
      discordMessage?: DiscordMessage;
    }
  ) {
    super(messenger, opts);
    this.url = url;
  }
}
