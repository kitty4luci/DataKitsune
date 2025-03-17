import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { join } from "path";
import * as dotenv from "dotenv";

dotenv.config();
export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: [join(__dirname, "..", "entities", "*.entity.{ts,js}")],
  migrations: [join(__dirname, "..", "migrations", "*.{ts,js}")],
  migrationsTableName: "migrations_typeorm",
  namingStrategy: new SnakeNamingStrategy(),
});
