import { DataSource, Repository } from "typeorm";
import { BotEventEntity } from "../entities/bot-event.entity";

export class BotEventRepository {
  private readonly repository: Repository<BotEventEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(BotEventEntity);
  }

  /**
   * Logs a new bot status event and updates previous events for this chat to not be current
   */
  async logStatusChange(
    chatId: string,
    status: string,
    actorId: string,
    actorUsername?: string,
    chatInfo?: Record<string, any>
  ): Promise<BotEventEntity> {
    // First, mark all previous events for this chat as not current
    await this.repository
      .createQueryBuilder()
      .update(BotEventEntity)
      .set({ current: false })
      .where("chatId = :chatId AND current = true", { chatId })
      .execute();

    // Then create a new event record
    const event = new BotEventEntity();
    event.chatId = chatId;
    event.status = status;
    event.actorId = actorId;
    event.actorUsername = actorUsername;
    event.chatInfo = chatInfo;
    event.current = true;

    return await this.repository.save(event);
  }

  /**
   * Gets the current status of the bot in a specific chat
   */
  async getCurrentStatus(chatId: string): Promise<BotEventEntity | null> {
    return await this.repository.findOne({
      where: {
        chatId,
        current: true,
      },
    });
  }

  /**
   * Gets all chat IDs where the bot currently has a specific status
   */
  async getChatsByStatus(status: string): Promise<string[]> {
    const results = await this.repository
      .createQueryBuilder("event")
      .select("event.chatId")
      .where("event.status = :status", { status })
      .andWhere("event.current = true")
      .getMany();

    return results.map((event) => event.chatId);
  }

  /**
   * Gets history of status changes for a specific chat
   */
  async getStatusHistory(chatId: string): Promise<BotEventEntity[]> {
    return await this.repository.find({
      where: { chatId },
      order: { createdAt: "DESC" },
    });
  }
}
