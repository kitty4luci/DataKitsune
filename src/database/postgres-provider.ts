import { join } from "path";
import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

export class PostgresProvider {
  private static instance: DataSource;
  private constructor() {}

  public static async getConnection(
    host: string,
    port: number,
    username: string,
    password: string,
    database: string
  ): Promise<DataSource> {
    if (!PostgresProvider.instance) {
      const dataSource = new DataSource({
        type: "postgres",
        host,
        port,
        username,
        password,
        database,
        synchronize: false,
        entities: [join(__dirname, "..", "entities", "*.entity.{ts,js}")],
        migrations: [join(__dirname, "..", "migrations", "*.{ts,js}")],
        migrationsTableName: "migrations_typeorm",
        namingStrategy: new SnakeNamingStrategy(),
      });

      await dataSource.initialize();
      PostgresProvider.instance = dataSource;
    }

    return PostgresProvider.instance;
  }
}
