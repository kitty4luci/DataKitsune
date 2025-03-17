import { DataSource, Repository } from "typeorm";
import { DescriptionEntity } from "../entities/description.entity";

export class DescriptionRepository {
  private readonly repository: Repository<DescriptionEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(DescriptionEntity);
  }

  async addDescription(
    link: Partial<DescriptionEntity>
  ): Promise<DescriptionEntity> {
    return await this.repository.save(link);
  }
}
