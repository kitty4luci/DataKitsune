import { DiscordMessage } from "./discord-message.dto";
import { Messenger } from "./messenger.type";
import { TelegramMessage } from "./telegram-message.dto";

export class BaseDto {
  messenger: Messenger;

  telegramMessage?: TelegramMessage;
  discordMessage?: DiscordMessage;

  constructor(
    messenger: Messenger,
    opts?: {
      telegramMessage?: TelegramMessage;
      discordMessage?: DiscordMessage;
    }
  ) {
    this.messenger = messenger;
    this.telegramMessage = opts?.telegramMessage;
    this.discordMessage = opts?.discordMessage;
  }
}
