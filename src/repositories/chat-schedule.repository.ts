import { DataSource, Repository } from "typeorm";
import { ChatSchedule } from "../entities/chat-schedule.entity";

export class ChatScheduleRepository {
  private repository: Repository<ChatSchedule>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(ChatSchedule);
  }

  async save(schedule: ChatSchedule): Promise<ChatSchedule> {
    return this.repository.save(schedule);
  }

  async findByMessengerAndActorId(
    messenger: string,
    actorId: string
  ): Promise<ChatSchedule | null> {
    return this.repository.findOne({
      where: {
        messenger,
        actorId,
      },
    });
  }

  async findByMessenger(messenger: string): Promise<ChatSchedule | null> {
    return this.repository.findOne({
      where: {
        messenger,
      },
    });
  }

  async findAllEnabled(): Promise<ChatSchedule[]> {
    return this.repository.find({
      where: {
        enabled: true,
      },
    });
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
