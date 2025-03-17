import { MigrationInterface, QueryRunner } from "typeorm";

export class R2rCollectionFixed1740312567044 implements MigrationInterface {
  name = "R2rCollectionFixed1740312567044";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_09ed55da4c7e000b71e1079540"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cb2284b3197770a007b134bd58"`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_09ed55da4c7e000b71e1079540" ON "r2r_collection_map" ("messenger", "context_id", "collection_id") `
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_cb2284b3197770a007b134bd58" ON "r2r_collection_map" ("messenger", "context_id") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cb2284b3197770a007b134bd58"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_09ed55da4c7e000b71e1079540"`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cb2284b3197770a007b134bd58" ON "r2r_collection_map" ("messenger", "context_id") `
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_09ed55da4c7e000b71e1079540" ON "r2r_collection_map" ("messenger", "context_id", "collection_id") `
    );
  }
}
