import { Context } from "telegraf";
import { IHandler } from "../../interfaces/handler";
import { CommandContextExtn } from "telegraf/typings/telegram-types";
import { SearchService } from "../../services/search-service";
import { UriService } from "../../services/uri-service";

export class SearchCommandHandler
  implements
    IHandler<Context<{ message: any; update_id: number }> & CommandContextExtn>
{
  constructor(private readonly searchService: SearchService) {}

  async handle(
    ctx: Context<{ message: any; update_id: number }> & CommandContextExtn
  ): Promise<void> {
    const searchText = ctx.message.text.split(" ").slice(1).join(" ");
    if (!searchText) {
      await ctx.reply("Try to write something to search for");
      return;
    }

    const now = Date.now();
    const userId = ctx.from?.id?.toString();
    const username = ctx.from?.username;

    const result = await this.searchService.search(
      "telegram",
      ctx.chat.id.toString(),
      searchText,
      userId,
      username
    );
    const elapsedSeconds = ((Date.now() - now) / 1000).toFixed(2);

    const distinctResults = result.filter(
      (link, index, self) => index === self.findIndex((l) => l.url === link.url)
    );

    // Format results as HTML with enumerated links
    const formattedResults =
      distinctResults.length > 0
        ? distinctResults
            .map(
              (link) =>
                `🔗 <a href="${link.url}">${UriService.formatUrl(link.url)}</a>`
            )
            .join("\n\n")
        : "No results found";

    const response = `<b>Search results</b>, ${elapsedSeconds}s:\n\n${formattedResults}`;
    await ctx.reply(response, {
      parse_mode: "HTML",
      reply_parameters: {
        message_id: ctx.message.message_id,
      },
      link_preview_options: {
        is_disabled: true,
      },
    });
  }
}
