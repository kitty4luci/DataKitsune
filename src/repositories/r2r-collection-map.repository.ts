import { DataSource, Repository } from "typeorm";
import { R2rCollectionMapEntity } from "../entities/r2r-collection-map.entity";

export class R2rCollectionMapRepository {
  private repository: Repository<R2rCollectionMapEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(R2rCollectionMapEntity);
  }

  async tryAddCollection(
    messenger: string,
    contextId: string,
    collectionId: string
  ): Promise<boolean> {
    try {
      await this.repository.insert({
        messenger,
        contextId,
        collectionId,
      });
      return true;
    } catch (error) {
      // Check if error is a duplicate key violation
      if (error.code === "23505") {
        return false;
      }
      throw error;
    }
  }

  async getCollectionId(
    messenger: string,
    contextId: string
  ): Promise<string | null> {
    const mapping = await this.repository.findOne({
      where: {
        messenger,
        contextId,
      },
      select: ["collectionId"],
    });

    return mapping?.collectionId ?? null;
  }
}
