import { Context } from "telegraf";
import { IHandler } from "../../interfaces/handler";
import { CommandContextExtn } from "telegraf/typings/telegram-types";
import { ScheduleService } from "../../services/schedule-service";

export class UnscheduleCommandHandler
  implements
    IHandler<Context<{ message: any; update_id: number }> & CommandContextExtn>
{
  constructor(private readonly scheduleService: ScheduleService) {}

  async handle(
    ctx: Context<{ message: any; update_id: number }> & CommandContextExtn
  ): Promise<void> {
    const userId = ctx.from.id.toString();
    try {
      const result = await this.scheduleService.disableSchedule(
        "telegram",
        userId
      );

      if (result) {
        await ctx.reply("✅ Scheduled updates have been disabled.", {
          reply_parameters: {
            message_id: ctx.message.message_id,
          },
        });
      } else {
        await ctx.reply("No scheduled updates were found.", {
          reply_parameters: {
            message_id: ctx.message.message_id,
          },
        });
      }
    } catch (error) {
      console.error("Error disabling schedule:", error);
      await ctx.reply(`❌ Error disabling schedule: ${error.message}`, {
        reply_parameters: {
          message_id: ctx.message.message_id,
        },
      });
    }
  }
}
