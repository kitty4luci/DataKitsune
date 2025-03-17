import { DataSource, Repository } from "typeorm";
import { ContentEntity } from "../entities/content.entity";

export class ContentRepository {
  private readonly repository: Repository<ContentEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(ContentEntity);
  }

  async addContent(link: Partial<ContentEntity>): Promise<ContentEntity> {
    return await this.repository.save(link);
  }
}
