import { Context } from "telegraf";
import { IHandler } from "../../interfaces/handler";
import { CommandContextExtn } from "telegraf/typings/telegram-types";
import { ScheduleService } from "../../services/schedule-service";
import { Logger } from "../../services/system/logger";

export class ScheduleCommandHandler
  implements
    IHandler<Context<{ message: any; update_id: number }> & CommandContextExtn>
{
  private readonly logger: Logger = new Logger(ScheduleCommandHandler.name);

  constructor(private readonly scheduleService: ScheduleService) {}

  async handle(
    ctx: Context<{ message: any; update_id: number }> & CommandContextExtn
  ): Promise<void> {
    const userId = ctx.from.id.toString();
    const args = ctx.message.text.split(" ").slice(1);

    try {
      if (args.length === 0) {
        await ctx.reply(
          "Please specify a time in format <b>HH:MM</b>, for example: <code>/schedule 09:00</code>",
          {
            parse_mode: "HTML",
            reply_parameters: {
              message_id: ctx.message.message_id,
            },
          }
        );
        return;
      }

      const timeStr = args[0];
      const timezoneStr = args.length > 1 ? args.slice(1).join(" ") : undefined;

      await this.scheduleService.setSchedule(
        "telegram",
        userId,
        timeStr,
        timezoneStr
      );

      const timezoneText = timezoneStr
        ? ` in timezone ${timezoneStr}`
        : " (UTC)";

      await ctx.reply(
        `✅ Daily updates have been scheduled at ${timeStr}${timezoneText}`,
        {
          reply_parameters: {
            message_id: ctx.message.message_id,
          },
        }
      );
    } catch (error) {
      console.error("Error setting schedule:", { error, userId, args });
      await ctx.reply(`❌ Error setting schedule: ${error.message}`, {
        parse_mode: "HTML",
        reply_parameters: {
          message_id: ctx.message.message_id,
        },
      });
    }
  }
}
