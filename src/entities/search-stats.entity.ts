import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity("search_stats")
@Index(["messenger", "contextId", "userId"], { background: true })
@Index(["query"], { background: true })
@Index(["elapsedTimeMs"], { background: true })
export class SearchStatsEntity {
  @PrimaryGeneratedColumn({ type: "integer" })
  id: number;

  @Column({
    type: "varchar",
    length: 32,
    nullable: false,
    comment: 'Source messenger: "telegram", "discord", "slack"',
  })
  messenger: string;

  @Column({
    type: "varchar",
    length: 128,
    nullable: false,
    comment: "Chat/Channel/Group ID from the messenger",
  })
  contextId: string;

  @Column({
    type: "varchar",
    length: 128,
    nullable: true,
    comment: "User ID from the messenger",
  })
  userId: string;

  @Column({
    type: "varchar",
    length: 128,
    nullable: true,
    comment: "Username from the messenger",
  })
  username: string;

  @Column({
    type: "text",
    nullable: false,
    comment: "Search query text",
  })
  query: string;

  @Column({
    type: "integer",
    nullable: false,
    comment: "Query execution time in milliseconds",
  })
  elapsedTimeMs: number;

  @Column({
    type: "jsonb",
    nullable: true,
    comment: "Search results with url, linkId, messageId and score",
  })
  results: {
    url: string;
    linkId: string;
    messageId: string;
    score: number;
  }[];

  @CreateDateColumn()
  createdAt: Date;
}
