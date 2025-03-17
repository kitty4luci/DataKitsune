import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1740151810273 implements MigrationInterface {
  name = "InitialMigration1740151810273";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "r2r_collection_map" ("id" SERIAL NOT NULL, "messenger" character varying(32) NOT NULL, "context_id" character varying(128) NOT NULL, "collection_id" uuid NOT NULL, CONSTRAINT "PK_7653bc3046dd7a4b8193a9c1d27" PRIMARY KEY ("id")); COMMENT ON COLUMN "r2r_collection_map"."messenger" IS 'Source messenger: TELEGRAM, DISCORD, SLACK'; COMMENT ON COLUMN "r2r_collection_map"."context_id" IS 'Chat/Channel/Group ID from the messenger'; COMMENT ON COLUMN "r2r_collection_map"."collection_id" IS 'R2R document ID'`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_09ed55da4c7e000b71e1079540" ON "r2r_collection_map" ("messenger", "context_id", "collection_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cb2284b3197770a007b134bd58" ON "r2r_collection_map" ("messenger", "context_id") `
    );
    await queryRunner.query(
      `CREATE TABLE "description" ("id" SERIAL NOT NULL, "description" character varying(4096) NOT NULL, "link_id" integer NOT NULL, CONSTRAINT "REL_9017df2c6fa9bc9d06a3e4d3b2" UNIQUE ("link_id"), CONSTRAINT "PK_313ee7159517cb494d532ee5466" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "content" ("id" SERIAL NOT NULL, "title" character varying(2048) NOT NULL, "markdown" text NOT NULL, "language" character varying(8), "link_id" integer NOT NULL, CONSTRAINT "REL_a88b6e0b6f49fb25180ec9af12" UNIQUE ("link_id"), CONSTRAINT "PK_6a2083913f3647b44f205204e36" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "link" ("id" SERIAL NOT NULL, "messenger" character varying(32) NOT NULL, "message_id" character varying(64) NOT NULL, "context_id" character varying(128) NOT NULL, "url" character varying(2048) NOT NULL, "raw" jsonb, "added_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_26206fb7186da72fbb9eaa3fac9" PRIMARY KEY ("id")); COMMENT ON COLUMN "link"."messenger" IS 'Source messenger: TELEGRAM, DISCORD, SLACK'; COMMENT ON COLUMN "link"."message_id" IS 'Original message ID from the messenger'; COMMENT ON COLUMN "link"."context_id" IS 'Chat/Channel/Group ID from the messenger'`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_036fdbaecf0613097d899b5ac1" ON "link" ("messenger", "context_id", "message_id") `
    );
    await queryRunner.query(
      `ALTER TABLE "description" ADD CONSTRAINT "FK_9017df2c6fa9bc9d06a3e4d3b23" FOREIGN KEY ("link_id") REFERENCES "link"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "content" ADD CONSTRAINT "FK_a88b6e0b6f49fb25180ec9af129" FOREIGN KEY ("link_id") REFERENCES "link"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "content" DROP CONSTRAINT "FK_a88b6e0b6f49fb25180ec9af129"`
    );
    await queryRunner.query(
      `ALTER TABLE "description" DROP CONSTRAINT "FK_9017df2c6fa9bc9d06a3e4d3b23"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_036fdbaecf0613097d899b5ac1"`
    );
    await queryRunner.query(`DROP TABLE "link"`);
    await queryRunner.query(`DROP TABLE "content"`);
    await queryRunner.query(`DROP TABLE "description"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cb2284b3197770a007b134bd58"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_09ed55da4c7e000b71e1079540"`
    );
    await queryRunner.query(`DROP TABLE "r2r_collection_map"`);
  }
}
