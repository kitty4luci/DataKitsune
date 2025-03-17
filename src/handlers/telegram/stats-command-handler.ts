import { Context } from "telegraf";
import { IHandler } from "../../interfaces/handler";
import { CommandContextExtn } from "telegraf/typings/telegram-types";
import { LinkRepository } from "../../repositories/link.repository";

export class StatsCommandHandler
  implements
    IHandler<Context<{ message: any; update_id: number }> & CommandContextExtn>
{
  constructor(private readonly linkRepo: LinkRepository) {}

  async handle(
    ctx: Context<{ message: any; update_id: number }> & CommandContextExtn
  ): Promise<void> {
    const userStats = await this.linkRepo.getUserStats(
      "telegram",
      ctx.chat.id.toString()
    );

    if (userStats.length === 0) {
      await ctx.reply("No links have been shared in this chat yet.");
      return;
    }

    const statsMessage = await this.formatStatsMessage(userStats);

    await ctx.reply(statsMessage, {
      parse_mode: "HTML",
      reply_parameters: {
        message_id: ctx.message.message_id,
      },
      link_preview_options: {
        is_disabled: true,
      },
    });
  }

  private async formatStatsMessage(
    stats: Array<{ username: string; count: number }>
  ): Promise<string> {
    const topUsers = stats.slice(0, 10);

    let message = `<b>📊 Link Sharing Statistics</b>\n\n`;
    message += "<b>Top link sharers:</b>\n";

    topUsers.forEach((user, index) => {
      let medal = "";
      if (index === 0) medal = "🥇 ";
      else if (index === 1) medal = "🥈 ";
      else if (index === 2) medal = "🥉 ";

      message += `${index + 1}. ${medal}<b><a href="https://t.me/${user.username}">${user.username}</a></b>: ${user.count} links\n`;
    });

    const totalLinks = stats.reduce((sum, user) => sum + Number(user.count), 0);
    message += `\n<b>Total links shared:</b> ${totalLinks}`;

    return message;
  }
}
