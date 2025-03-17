import { Context } from "telegraf";
import { IHandler } from "../../interfaces/handler";
import { Update } from "telegraf/typings/core/types/typegram";
import { CommandContextExtn } from "telegraf/typings/telegram-types";
import { SubscriptionService } from "../../services/subscription-service";

export class UnsubscribeCommandHandler
  implements
    IHandler<Context<{ message: any; update_id: number }> & CommandContextExtn>
{
  private readonly unsubscribeMessage =
    "You have successfully unsubscribed from updates.";
  private readonly noSubscriptionMessage =
    "You are not currently subscribed to updates.";

  constructor(private readonly subscriptionService: SubscriptionService) {}

  async handle(
    ctx: Context<{ message: any; update_id: number }> &
      Omit<Context<Update>, keyof Context<Update>> &
      CommandContextExtn
  ): Promise<void> {
    const chatId = ctx.message.chat.id.toString();
    const userId = ctx.message.from.id.toString();
    const messenger = "telegram";

    try {
      const success = await this.subscriptionService.unsubscribe(
        messenger,
        chatId,
        userId
      );

      if (success) {
        await ctx.telegram.sendMessage(
          userId,
          `You have unsubscribed from updates for <a href="https://t.me/${chatId}">this chat</a>.`,
          {
            parse_mode: "HTML",
            link_preview_options: {
              is_disabled: true,
            },
          }
        );
      }
    } catch (error) {
      await ctx.reply(`Failed to unsubscribe: ${error.message}`);
    }
  }
}
