import { Context, NarrowedContext } from "telegraf";
import { IHandler } from "../../interfaces/handler";
import { Update } from "telegraf/typings/core/types/typegram";
import { CommandContextExtn } from "telegraf/typings/telegram-types";

export class StartCommandHandler
  implements
    IHandler<Context<{ message: any; update_id: number }> & CommandContextExtn>
{
  private readonly startMessage = "Add me to any group chat to start using me!";

  constructor() {}

  async handle(
    ctx: Context<{ message: any; update_id: number }> &
      Omit<Context<Update>, keyof Context<Update>> &
      CommandContextExtn
  ): Promise<void> {
    await ctx.reply(this.startMessage);
  }
}
