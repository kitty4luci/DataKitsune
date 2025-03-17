import { DataSource, Repository } from "typeorm";
import { LinkEntity } from "../entities/link.entity";
import { Messenger } from "src/dtos/messenger.type";

export class LinkRepository {
  private readonly repository: Repository<LinkEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(LinkEntity);
  }

  async addLink(link: Partial<LinkEntity>): Promise<LinkEntity> {
    return await this.repository.save(link);
  }

  async getLastLinks(
    messenger: Messenger,
    contextId: string
  ): Promise<LinkEntity[]> {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    return await this.repository
      .createQueryBuilder("link")
      .distinctOn(["link.url"])
      .leftJoinAndSelect("link.description", "description")
      .leftJoinAndSelect("link.content", "content")
      .where("link.messenger = :messenger", { messenger })
      .andWhere("link.contextId = :contextId", { contextId })
      .andWhere("link.addedAt >= :twentyFourHoursAgo", { twentyFourHoursAgo })
      .orderBy("link.url")
      .addOrderBy("link.addedAt", "DESC")
      .getMany();
  }

  async getUserStats(
    messenger: Messenger,
    contextId: string
  ): Promise<Array<{ username: string; count: number }>> {
    return await this.repository
      .createQueryBuilder("link")
      .select("link.username", "username")
      .addSelect("COUNT(link.id)", "count")
      .where("link.messenger = :messenger", { messenger })
      .andWhere("link.contextId = :contextId", { contextId })
      .andWhere("link.username IS NOT NULL")
      .groupBy("link.username")
      .orderBy("count", "DESC")
      .getRawMany();
  }

  async getChatStats(
    messenger: Messenger
  ): Promise<Array<{ contextId: string; count: number }>> {
    return await this.repository
      .createQueryBuilder("link")
      .select("link.contextId", "contextId")
      .addSelect("COUNT(link.id)", "count")
      .where("link.messenger = :messenger", { messenger })
      .groupBy("link.contextId")
      .orderBy("count", "DESC")
      .getRawMany();
  }

  async getTotalUserStats(
    messenger: Messenger
  ): Promise<Array<{ username: string; count: number }>> {
    return await this.repository
      .createQueryBuilder("link")
      .select("link.username", "username")
      .addSelect("COUNT(link.id)", "count")
      .where("link.messenger = :messenger", { messenger })
      .andWhere("link.username IS NOT NULL")
      .groupBy("link.username")
      .orderBy("count", "DESC")
      .getRawMany();
  }
}
