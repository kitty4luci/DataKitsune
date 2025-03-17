import { BotEventRepository } from "../repositories/bot-event.repository";

export class BotStatusService {
  constructor(private readonly botEventRepository: BotEventRepository) {}

  async logBotJoined(
    chatId: string,
    status: "member" | "administrator",
    actorId: string,
    actorUsername?: string,
    chatInfo?: Record<string, any>
  ): Promise<void> {
    await this.botEventRepository.logStatusChange(
      chatId,
      status,
      actorId,
      actorUsername,
      chatInfo
    );
  }

  async logBotLeft(
    chatId: string,
    actorId: string,
    actorUsername?: string,
    chatInfo?: Record<string, any>
  ): Promise<void> {
    await this.botEventRepository.logStatusChange(
      chatId,
      "left",
      actorId,
      actorUsername,
      chatInfo
    );
  }

  async logBotKicked(
    chatId: string,
    actorId: string,
    actorUsername?: string,
    chatInfo?: Record<string, any>
  ): Promise<void> {
    await this.botEventRepository.logStatusChange(
      chatId,
      "kicked",
      actorId,
      actorUsername,
      chatInfo
    );
  }

  async logStatusChange(
    chatId: string,
    newStatus: string,
    actorId: string,
    actorUsername?: string,
    chatInfo?: Record<string, any>
  ): Promise<void> {
    await this.botEventRepository.logStatusChange(
      chatId,
      newStatus,
      actorId,
      actorUsername,
      chatInfo
    );
  }

  async getBotStatus(chatId: string): Promise<string | null> {
    const event = await this.botEventRepository.getCurrentStatus(chatId);
    return event ? event.status : null;
  }

  async isBotInChat(chatId: string): Promise<boolean> {
    const status = await this.getBotStatus(chatId);
    return status === "member" || status === "administrator";
  }

  async getActiveChats(): Promise<string[]> {
    const adminChats =
      await this.botEventRepository.getChatsByStatus("administrator");
    const memberChats =
      await this.botEventRepository.getChatsByStatus("member");

    return [...new Set([...adminChats, ...memberChats])];
  }

  async getStatusHistory(chatId: string): Promise<any[]> {
    return await this.botEventRepository.getStatusHistory(chatId);
  }
}
