import { Context, NarrowedContext, Telegraf } from "telegraf";
import { IHandler } from "src/interfaces/handler";
import { Message, Update } from "telegraf/typings/core/types/typegram";
import * as http from "http";
import * as tg from "telegraf/lib/core/types/typegram";
import { CommandContextExtn } from "telegraf/typings/telegram-types";

export class TelegramBot {
  private bot: Telegraf;

  constructor(
    private readonly messageHandler: IHandler<
      NarrowedContext<Context<Update>, Update.MessageUpdate<Message>>
    >,
    private readonly startCommandHandler: IHandler<
      Context<{ message: any; update_id: number }> & CommandContextExtn
    >,
    private readonly helpCommandHandler: IHandler<
      Context<{ message: any; update_id: number }> & CommandContextExtn
    >,
    private readonly searchCommandHandler: IHandler<
      Context<{ message: any; update_id: number }> & CommandContextExtn
    >,
    private readonly statsCommandHandler: IHandler<
      Context<{ message: any; update_id: number }> & CommandContextExtn
    >,
    private readonly scheduleCommandHandler: IHandler<
      Context<{ message: any; update_id: number }> & CommandContextExtn
    >,
    private readonly unscheduleCommandHandler: IHandler<
      Context<{ message: any; update_id: number }> & CommandContextExtn
    >,
    private readonly subscribeCommandHandler: IHandler<
      Context<{ message: any; update_id: number }> & CommandContextExtn
    >,
    private readonly unsubscribeCommandHandler: IHandler<
      Context<{ message: any; update_id: number }> & CommandContextExtn
    >,
    private readonly summaryCommandHandler: IHandler<
      Context<{ message: any; update_id: number }> & CommandContextExtn
    >,
    private readonly chatMemberStatusHandler: IHandler<
      NarrowedContext<Context<Update>, Update.MyChatMemberUpdate>
    >,
    private readonly paginationHandler: IHandler<Context>,
    apiToken: string,
    private readonly webhookDomain: string,
    private readonly webhookPath: string
  ) {
    this.bot = new Telegraf(apiToken);
    this.setupCommands();
  }

  private setupCommands(): void {
    this.bot.start(
      this.startCommandHandler.handle.bind(this.startCommandHandler)
    );
    this.bot.on(
      "my_chat_member",
      this.chatMemberStatusHandler.handle.bind(this.chatMemberStatusHandler)
    );
    this.bot.command(
      "help",
      this.helpCommandHandler.handle.bind(this.helpCommandHandler)
    );
    this.bot.command(
      "search",
      this.searchCommandHandler.handle.bind(this.searchCommandHandler)
    );
    this.bot.command(
      "stats",
      this.statsCommandHandler.handle.bind(this.statsCommandHandler)
    );
    this.bot.command(
      "schedule",
      this.scheduleCommandHandler.handle.bind(this.scheduleCommandHandler)
    );
    this.bot.command(
      "unschedule",
      this.unscheduleCommandHandler.handle.bind(this.unscheduleCommandHandler)
    );
    this.bot.command(
      "summary",
      this.summaryCommandHandler.handle.bind(this.summaryCommandHandler)
    );
    this.bot.command(
      "subscribe",
      this.subscribeCommandHandler.handle.bind(this.subscribeCommandHandler)
    );
    this.bot.command(
      "unsubscribe",
      this.unsubscribeCommandHandler.handle.bind(this.unsubscribeCommandHandler)
    );

    this.bot.on(
      "callback_query",
      this.paginationHandler.handle.bind(this.paginationHandler)
    );

    this.bot.on(
      "message",
      this.messageHandler.handle.bind(this.messageHandler)
    );

    this.bot.telegram.setMyCommands(
      [
        {
          command: "search",
          description:
            "Searches indexed URLs shared in this chat and returns the most relevant",
        },
        {
          command: "stats",
          description: "Shows statistics about links shared in this chat",
        },
        {
          command: "help",
          description: "Shows help information about this bot",
        },
        {
          command: "subscribe",
          description: "Subscribe to updates for this chat",
        },
        {
          command: "unsubscribe",
          description: "Unsubscribe from updates for this chat",
        },
      ],
      { scope: { type: "all_group_chats" } }
    );

    this.bot.telegram.setMyCommands(
      [
        {
          command: "search",
          description:
            "Searches indexed URLs shared in this chat and returns the most relevant",
        },
        {
          command: "schedule",
          description:
            "Set up scheduled daily updates (e.g. /schedule 09:00 +3)",
        },
        {
          command: "unschedule",
          description: "Disable scheduled updates for this chat",
        },
        {
          command: "summary",
          description:
            "Get an immediate summary of links from your subscribed chats",
        },
      ],
      { scope: { type: "all_private_chats" } }
    );
  }

  public async createWebhook(): Promise<
    (
      req: http.IncomingMessage & {
        body?: tg.Update;
      },
      res: http.ServerResponse,
      next?: () => void
    ) => Promise<void>
  > {
    return this.bot.createWebhook({
      domain: this.webhookDomain,
      path: this.webhookPath,
    });
  }
}
