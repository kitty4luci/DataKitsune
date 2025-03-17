import { Context } from "telegraf";
import { IHandler } from "../../interfaces/handler";
import { Update } from "telegraf/typings/core/types/typegram";
import { CommandContextExtn } from "telegraf/typings/telegram-types";
import { ScheduleService } from "../../services/schedule-service";
import { SubscriptionService } from "../../services/subscription-service";
import { Logger } from "../../services/system/logger";
import { UriService } from "../../services/uri-service";

export class SubscribeCommandHandler
  implements
    IHandler<Context<{ message: any; update_id: number }> & CommandContextExtn>
{
  private readonly logger: Logger = new Logger(SubscribeCommandHandler.name);

  constructor(
    private readonly scheduleService: ScheduleService,
    private readonly subscriptionService: SubscriptionService,
    private readonly telegramBotUsername: string
  ) {}

  async handle(
    ctx: Context<{ message: any; update_id: number }> &
      Omit<Context<Update>, keyof Context<Update>> &
      CommandContextExtn
  ): Promise<void> {
    const chatId = ctx.message.chat.id.toString();
    const userId = ctx.message.from.id.toString();
    const username = ctx.message.from.username;
    const defaultTime = "12:00";
    const chatLink = UriService.formatTelegramChatLink(chatId);

    const schedule = await this.scheduleService.getSchedule("telegram", userId);
    const prevSchedule = !!schedule;

    if (!schedule)
      this.scheduleService.setSchedule("telegram", userId, defaultTime);

    try {
      await this.subscriptionService.subscribe(
        "telegram",
        chatId,
        userId,
        username
      );
    } catch (error) {
      this.logger.error("User failed to subscribe", {
        username,
        userId,
        chatId,
        error,
      });
      return;
    }

    try {
      const message = prevSchedule
        ? `✅ You have successfully updated your subscription to daily link updates from <a href="${chatLink}">this chat</a>. You will receive updates at ${schedule.hour}:${String(schedule.minute).padStart(2, "0")} (UTC${schedule.timezoneOffset >= 0 ? "+" : ""}${schedule.timezoneOffset}) daily. You can customize the schedule with /schedule command.`
        : `✅ You have successfully subscribed to daily link updates for <a href="${chatLink}">this chat</a>. You'll receive updates at ${defaultTime} UTC daily. You can customize the schedule with /schedule command.`;

      await ctx.telegram.sendMessage(userId, message, {
        parse_mode: "HTML",
        link_preview_options: {
          is_disabled: true,
        },
      });
    } catch (error) {
      this.logger.warn("User has not started the bot", { username, userId });
      await ctx.reply(
        `Please start the bot by clicking <a href="http://t.me/${this.telegramBotUsername}">here</a> and pressing <b>Start</b> to activate the subscription.`,
        {
          parse_mode: "HTML",
          reply_parameters: {
            message_id: ctx.message.message_id,
          },
        }
      );
    }
  }
}
