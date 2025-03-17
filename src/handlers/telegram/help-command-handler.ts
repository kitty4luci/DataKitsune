import { Context, NarrowedContext } from "telegraf";
import { IHandler } from "../../interfaces/handler";
import { Update } from "telegraf/typings/core/types/typegram";
import { CommandContextExtn } from "telegraf/typings/telegram-types";

export class HelpCommandHandler
  implements
    IHandler<
      Context<{ message: any; update_id: number }> &
        Omit<Context<Update>, keyof Context<Update>> &
        CommandContextExtn
    >
{
  private readonly helpMessage = `
<b>About:</b>
The bot uses AI to understand and index the content of links, making them easy to find later.

<b>Privacy Note:</b>
The bot stores only URLs shared in chats - no messages, media, or other content is stored or processed.

<b>Group Chat Commands:</b>
/search [query] - Search for links previously shared in this chat
/stats - Show link sharing statistics for this chat
/help - Show this help message

<b>Direct Message Commands:</b>
/search [query] - Search for links in your personal collection
/schedule [time] [timezone] - Set up a scheduled daily update (e.g. /schedule 09:00 +3)
/unschedule - Disable scheduled updates
/summary - Get immediate summary of links from your subscribed chats
/help - Show this help message

<b>Personal Link Collection:</b>
• Send or forward any link directly to this bot in a private chat to store it in your personal collection
• The bot will automatically process and index the link's content
• Use /search in the private chat to find links from your personal collection based on content
• You'll receive a notification when your link has been processed

<b>How it works:</b>
1. Add this bot to your group chat or message it directly
2. Share links in the group chat or send links directly to the bot
3. The bot will automatically index the content of these links
4. Use /search [query] to find links by their content
5. Use /stats in group chats to see who shares the most links
6. Message the bot directly to set up scheduled updates for daily summaries

<b>Search Examples:</b>
<code>/search machine learning</code> - Find links about machine learning
<code>/search python tutorial</code> - Find links containing Python tutorials
<code>/search climate data</code> - Find links with climate data information

<b>Schedule Examples:</b>
<code>/schedule 09:00</code> - Set update time at 9 AM (UTC)
<code>/schedule 17:30 +3</code> - Set update time at 5:30 PM (UTC+3)
<code>/schedule 08:00 Moscow</code> - Set update time at 8 AM Moscow time
<code>/schedule 22:15 -5</code> - Set update time at 10:15 PM (UTC-5)
`;

  constructor() {}

  async handle(
    ctx: Context<{ message: any; update_id: number }> &
      Omit<Context<Update>, keyof Context<Update>> &
      CommandContextExtn
  ): Promise<void> {
    await ctx.reply(this.helpMessage, {
      parse_mode: "HTML",
      link_preview_options: {
        is_disabled: true,
      },
    });
  }
}
