import { MigrationInterface, QueryRunner } from "typeorm";

export class StatsAndSchedulerAdded1740663542130 implements MigrationInterface {
  name = "StatsAndSchedulerAdded1740663542130";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "search_stats" ("id" SERIAL NOT NULL, "messenger" character varying(32) NOT NULL, "context_id" character varying(128) NOT NULL, "user_id" character varying(128), "username" character varying(128), "query" text NOT NULL, "elapsed_time_ms" integer NOT NULL, "results" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_df15253dca33e87241158d8b200" PRIMARY KEY ("id")); COMMENT ON COLUMN "search_stats"."messenger" IS 'Source messenger: "telegram", "discord", "slack"'; COMMENT ON COLUMN "search_stats"."context_id" IS 'Chat/Channel/Group ID from the messenger'; COMMENT ON COLUMN "search_stats"."user_id" IS 'User ID from the messenger'; COMMENT ON COLUMN "search_stats"."username" IS 'Username from the messenger'; COMMENT ON COLUMN "search_stats"."query" IS 'Search query text'; COMMENT ON COLUMN "search_stats"."elapsed_time_ms" IS 'Query execution time in milliseconds'; COMMENT ON COLUMN "search_stats"."results" IS 'Search results with url, linkId, messageId and score'`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1bd94b08c11f459ce8cf958391" ON "search_stats" ("elapsed_time_ms") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_099d2a0e9d40bbbc36ab160adc" ON "search_stats" ("query") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_57fce9d16b9883447f0113b0b9" ON "search_stats" ("messenger", "context_id", "user_id") `
    );
    await queryRunner.query(
      `CREATE TABLE "chat_schedules" ("id" SERIAL NOT NULL, "messenger" character varying(32) NOT NULL, "context_id" character varying(128) NOT NULL, "hour" smallint NOT NULL, "minute" smallint NOT NULL, "timezone_offset" smallint NOT NULL DEFAULT '0', "enabled" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_messenger_context_id" UNIQUE ("messenger", "context_id"), CONSTRAINT "PK_3e7bdc3c02f6ff7d4886b7a2dde" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f8f8817990c06ffce3288317be" ON "chat_schedules" ("enabled") `
    );
    await queryRunner.query(
      `CREATE TABLE "bot_events" ("id" SERIAL NOT NULL, "chat_id" character varying(128) NOT NULL, "status" character varying(32) NOT NULL, "actor_id" character varying(128) NOT NULL, "actor_username" character varying(128), "chat_info" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "current" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_84d6f68bbf08f3006d527d18ed0" PRIMARY KEY ("id")); COMMENT ON COLUMN "bot_events"."status" IS 'Current status of the bot in chat: member, administrator, left'; COMMENT ON COLUMN "bot_events"."actor_id" IS 'Telegram user ID who changed the bot status'; COMMENT ON COLUMN "bot_events"."actor_username" IS 'Telegram username who changed the bot status'; COMMENT ON COLUMN "bot_events"."chat_info" IS 'Additional chat information'; COMMENT ON COLUMN "bot_events"."current" IS 'Whether this is the current status'`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_aa8e079b777ae38384eddf1391" ON "bot_events" ("chat_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0196227935d7be8ee71afe6d69" ON "bot_events" ("current") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f327ea494617bee0331aca2ea0" ON "bot_events" ("chat_id") WHERE current = true`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f327ea494617bee0331aca2ea0"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0196227935d7be8ee71afe6d69"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_aa8e079b777ae38384eddf1391"`
    );
    await queryRunner.query(`DROP TABLE "bot_events"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f8f8817990c06ffce3288317be"`
    );
    await queryRunner.query(`DROP TABLE "chat_schedules"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_57fce9d16b9883447f0113b0b9"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_099d2a0e9d40bbbc36ab160adc"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1bd94b08c11f459ce8cf958391"`
    );
    await queryRunner.query(`DROP TABLE "search_stats"`);
  }
}
