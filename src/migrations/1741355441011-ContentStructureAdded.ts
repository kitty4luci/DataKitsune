import { MigrationInterface, QueryRunner } from "typeorm";

export class ContentStructureAdded1741355441011 implements MigrationInterface {
  name = "ContentStructureAdded1741355441011";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "content_structure" ("id" SERIAL NOT NULL, "content_id" integer NOT NULL, "link_id" integer NOT NULL, "url" text NOT NULL, "structure" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2fb9e5137ed8f8701605dd791ac" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dd400ebbd34159e8f2ca58de18" ON "content_structure" ("content_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b35ddca4289160e1317a86e221" ON "content_structure" ("link_id") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b35ddca4289160e1317a86e221"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dd400ebbd34159e8f2ca58de18"`
    );
    await queryRunner.query(`DROP TABLE "content_structure"`);
  }
}
