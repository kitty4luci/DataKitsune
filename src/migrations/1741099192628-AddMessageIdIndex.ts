import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMessageIdIndex1741099192628 implements MigrationInterface {
  name = "AddMessageIdIndex1741099192628";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_update_pagination_message_id" ON "update_pagination" ("message_id") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_update_pagination_message_id"`
    );
  }
}
