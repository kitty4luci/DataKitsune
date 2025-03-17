import { DataSource, Repository } from "typeorm";
import { UpdatePaginationEntity } from "../entities/update-pagination.entity";
import { LinkWithDescription } from "../dtos/messenger.type";

export class UpdatePaginationRepository {
  private readonly repository: Repository<UpdatePaginationEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(UpdatePaginationEntity);
  }

  async createPagination(
    messenger: string,
    userId: string,
    chatId: string,
    messageId: string,
    links: LinkWithDescription[]
  ): Promise<UpdatePaginationEntity> {
    const totalPages = Math.ceil(links.length / 5);

    const pagination = this.repository.create({
      messenger,
      userId,
      chatId,
      messageId,
      links,
      totalPages,
      currentPage: 1,
    });

    return this.repository.save(pagination);
  }

  async getByMessageId(
    messageId: string
  ): Promise<UpdatePaginationEntity | null> {
    return this.repository.findOne({ where: { messageId } });
  }

  async updatePage(id: string, page: number): Promise<void> {
    await this.repository.update(id, { currentPage: page });
  }
}
