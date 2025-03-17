import { Context, NarrowedContext, Telegraf } from "telegraf";
import { IHandler } from "../../interfaces/handler";
import { Update } from "telegraf/typings/core/types/typegram";
import { BotStatusService } from "../../services/bot-status-service";
import { Logger } from "../../services/system/logger";

export class ChatMemberStatusHandler
  implements
    IHandler<NarrowedContext<Context<Update>, Update.MyChatMemberUpdate>>
{
  private readonly logger = new Logger(ChatMemberStatusHandler.name);

  constructor(private readonly statusService: BotStatusService) {}

  async handle(
    ctx: NarrowedContext<Context<Update>, Update.MyChatMemberUpdate>
  ): Promise<void> {
    const chatId = ctx.chat.id.toString();
    const actorId = ctx.from.id.toString();
    const actorUsername = ctx.from.username;
    const newStatus = ctx.update.my_chat_member.new_chat_member.status;
    const oldStatus = ctx.update.my_chat_member.old_chat_member.status;

    if (newStatus !== oldStatus) {
      if (
        (oldStatus === "left" || oldStatus === "kicked" || !oldStatus) &&
        (newStatus === "member" || newStatus === "administrator")
      ) {
        // Bot was added to a chat
        const chatInfo = await ctx.telegram.getChat(chatId);
        await this.statusService.logBotJoined(
          chatId,
          newStatus as "member" | "administrator",
          actorId,
          actorUsername,
          { type: chatInfo.type }
        );
      } else if (
        (oldStatus === "member" || oldStatus === "administrator") &&
        newStatus === "left"
      ) {
        // Bot was removed from a chat
        await this.statusService.logBotLeft(chatId, actorId, actorUsername);
      } else if (
        (oldStatus === "member" || oldStatus === "administrator") &&
        newStatus === "kicked"
      ) {
        // Bot was kicked from a chat
        await this.statusService.logBotKicked(chatId, actorId, actorUsername);
      } else if (oldStatus === "member" && newStatus === "administrator") {
        // Bot was promoted to administrator
        const chatInfo = await ctx.telegram.getChat(chatId);
        await this.statusService.logStatusChange(
          chatId,
          newStatus,
          actorId,
          actorUsername,
          { type: chatInfo.type }
        );
      } else {
        // Other status changes
        const chatInfo = await ctx.telegram.getChat(chatId);
        await this.statusService.logStatusChange(
          chatId,
          newStatus,
          actorId,
          actorUsername,
          { type: chatInfo.type }
        );
      }
    }
  }
}
