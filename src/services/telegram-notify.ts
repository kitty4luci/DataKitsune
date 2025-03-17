import { Markup, Telegraf } from "telegraf";
import { UriService } from "./uri-service";
import { LinkWithDescription } from "../dtos/messenger.type";
import { ParseMode } from "telegraf/typings/core/types/typegram";

export class TelegramNotify {
  private readonly telegraf: Telegraf;
  constructor(token: string) {
    this.telegraf = new Telegraf(token);
  }

  async sendNoPreview(
    chatId: string,
    message: string,
    options?: {
      replyToMessageId?: number;
      parseModel?: ParseMode;
    }
  ): Promise<{ messageId: number }> {
    const markup = {
      parse_mode: options.parseModel ?? ("HTML" as ParseMode),
      link_preview_options: {
        is_disabled: true,
      },
    };

    if (options?.replyToMessageId) {
      markup["reply_parameters"] = {
        message_id: options.replyToMessageId,
      };
    }

    const result = await this.telegraf.telegram.sendMessage(
      chatId,
      message,
      markup
    );

    return { messageId: result.message_id };
  }

  async sendPaginatedLinks(
    chatId: string,
    chatLink: string,
    links: LinkWithDescription[],
    currentPage: number,
    totalPages: number
  ): Promise<{ messageId: number }> {
    const PAGE_SIZE = 5;
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const pageLinks = links.slice(startIndex, startIndex + PAGE_SIZE);

    const linksMessage = pageLinks
      .map(
        (l) =>
          `🔗 <a href="${l.url}">${UriService.formatUrl(l.url)}</a>${l.description ? ` - ${l.description}` : ""}\n`
      )
      .join("\n");

    const message = `
<b>Here are the links shared in <a href="${chatLink}">this chat</a> in the last 24 hours:</b>
${totalPages > 1 ? `\n<b>Page ${currentPage}/${totalPages}</b>` : ""}
${linksMessage}
`;

    let markup = undefined;

    if (totalPages > 1) {
      markup = Markup.inlineKeyboard([
        ...(currentPage > 1
          ? [
              Markup.button.callback(
                `${currentPage - 1}/${totalPages} ⬅️ Previous`,
                `prev_page:${currentPage - 1}`
              ),
            ]
          : []),
        ...(currentPage < totalPages
          ? [
              Markup.button.callback(
                `Next ➡️ ${currentPage + 1}/${totalPages}`,
                `next_page:${currentPage + 1}`
              ),
            ]
          : []),
      ]);
    }

    const result = await this.telegraf.telegram.sendMessage(chatId, message, {
      parse_mode: "HTML",
      link_preview_options: {
        is_disabled: true,
      },
      ...markup,
    });

    return { messageId: result.message_id };
  }

  async updatePaginatedMessage(
    chatId: string,
    messageId: number,
    chatLink: string,
    links: LinkWithDescription[],
    currentPage: number,
    totalPages: number
  ): Promise<void> {
    const PAGE_SIZE = 5;
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const pageLinks = links.slice(startIndex, startIndex + PAGE_SIZE);

    const linksMessage = pageLinks
      .map(
        (l) =>
          `🔗 <a href="${l.url}">${UriService.formatUrl(l.url)}</a>${l.description ? ` - ${l.description}` : ""}\n`
      )
      .join("\n");

    const message = `
<b>Here are the links shared in <a href="${chatLink}">this chat</a> in the last 24 hours:</b>
${totalPages > 1 ? `\n<b>Page ${currentPage}/${totalPages}</b>` : ""}
${linksMessage}
`;

    let markup = undefined;

    if (totalPages > 1) {
      markup = Markup.inlineKeyboard([
        ...(currentPage > 1
          ? [
              Markup.button.callback(
                `${currentPage - 1}/${totalPages} ⬅️ Previous`,
                `prev_page:${currentPage - 1}`
              ),
            ]
          : []),
        ...(currentPage < totalPages
          ? [
              Markup.button.callback(
                `Next ➡️ ${currentPage + 1}/${totalPages}`,
                `next_page:${currentPage + 1}`
              ),
            ]
          : []),
      ]);
    }

    await this.telegraf.telegram.editMessageText(
      chatId,
      messageId,
      undefined,
      message,
      {
        parse_mode: "HTML",
        link_preview_options: {
          is_disabled: true,
        },
        ...markup,
      }
    );
  }
}
