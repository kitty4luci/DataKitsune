import { MigrationInterface, QueryRunner } from "typeorm";

export class OptionalContentTitle1740248757072 implements MigrationInterface {
  name = "OptionalContentTitle1740248757072";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "content" DROP COLUMN "markdown"`);
    await queryRunner.query(
      `ALTER TABLE "content" ADD "content" text NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "content" ALTER COLUMN "title" DROP NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "content" ALTER COLUMN "title" SET NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "content" DROP COLUMN "content"`);
    await queryRunner.query(
      `ALTER TABLE "content" ADD "markdown" text NOT NULL`
    );
  }
}
