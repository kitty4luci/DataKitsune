import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePaginationAdded1741099087235 implements MigrationInterface {
  name = "UpdatePaginationAdded1741099087235";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "update_pagination" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "messenger" character varying NOT NULL, "user_id" character varying NOT NULL, "chat_id" character varying NOT NULL, "message_id" character varying NOT NULL, "links" jsonb NOT NULL, "total_pages" integer NOT NULL DEFAULT '1', "current_page" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d3aca6aef91cb3e800d26d4e6b5" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "update_pagination"`);
  }
}
