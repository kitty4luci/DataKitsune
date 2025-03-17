import { MigrationInterface, QueryRunner } from "typeorm";

export class SubscribeChanges1741016691621 implements MigrationInterface {
  name = "SubscribeChanges1741016691621";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chat_schedules" DROP CONSTRAINT "UQ_messenger_context_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "chat_schedules" RENAME COLUMN "context_id" TO "actor_id"`
    );
    await queryRunner.query(
      `CREATE TABLE "chat_subscriptions" ("id" SERIAL NOT NULL, "messenger" character varying(32) NOT NULL, "context_id" character varying(128) NOT NULL, "actor_id" character varying(128) NOT NULL, "actor_username" character varying(128), "enabled" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ff2007d5ae17e34b3bc87753d6a" PRIMARY KEY ("id")); COMMENT ON COLUMN "chat_subscriptions"."context_id" IS 'Chat/Channel/Group ID from the messenger'; COMMENT ON COLUMN "chat_subscriptions"."actor_id" IS 'User ID who created the subscription'; COMMENT ON COLUMN "chat_subscriptions"."actor_username" IS 'Username who created the subscription'; COMMENT ON COLUMN "chat_subscriptions"."enabled" IS 'Whether this subscription is enabled'`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e2ded2036ad2a1072cb238d478" ON "chat_subscriptions" ("enabled") `
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_f9858ac2103e89ac38d38384af" ON "chat_subscriptions" ("messenger", "enabled", "context_id", "actor_id") `
    );
    await queryRunner.query(
      `ALTER TABLE "link" ADD "user_id" character varying(128)`
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "link"."user_id" IS 'User ID from the messenger'`
    );
    await queryRunner.query(
      `ALTER TABLE "link" ADD "username" character varying(128)`
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "link"."username" IS 'Username from the messenger'`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c9ee1f0963572e29cddb29151e" ON "chat_schedules" ("messenger") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6a4bbab0f08536349b276712d1" ON "chat_schedules" ("actor_id") `
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_3e0db8e9b8f811e5d5c8a10e24" ON "chat_schedules" ("messenger", "actor_id") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3e0db8e9b8f811e5d5c8a10e24"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6a4bbab0f08536349b276712d1"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c9ee1f0963572e29cddb29151e"`
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "link"."username" IS 'Username from the messenger'`
    );
    await queryRunner.query(`ALTER TABLE "link" DROP COLUMN "username"`);
    await queryRunner.query(
      `COMMENT ON COLUMN "link"."user_id" IS 'User ID from the messenger'`
    );
    await queryRunner.query(`ALTER TABLE "link" DROP COLUMN "user_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f9858ac2103e89ac38d38384af"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e2ded2036ad2a1072cb238d478"`
    );
    await queryRunner.query(`DROP TABLE "chat_subscriptions"`);
    await queryRunner.query(
      `ALTER TABLE "chat_schedules" RENAME COLUMN "actor_id" TO "context_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "chat_schedules" ADD CONSTRAINT "UQ_messenger_context_id" UNIQUE ("messenger", "context_id")`
    );
  }
}
