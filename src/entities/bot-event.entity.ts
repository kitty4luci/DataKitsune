import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

/**
 * Entity to track the bot's status in each chat
 */
@Entity("bot_events")
@Index(["chatId"], { where: "current = true" })
export class BotEventEntity {
  @PrimaryGeneratedColumn({ type: "integer" })
  id: number;

  @Column({
    type: "varchar",
    length: 128,
    nullable: false,
  })
  @Index()
  chatId: string;

  @Column({
    type: "varchar",
    length: 32,
    nullable: false,
    comment: "Current status of the bot in chat: member, administrator, left",
  })
  status: string;

  @Column({
    type: "varchar",
    length: 128,
    nullable: false,
    comment: "Telegram user ID who changed the bot status",
  })
  actorId: string;

  @Column({
    type: "varchar",
    length: 128,
    nullable: true,
    comment: "Telegram username who changed the bot status",
  })
  actorUsername: string;

  @Column({
    type: "jsonb",
    nullable: true,
    comment: "Additional chat information",
  })
  chatInfo: Record<string, any>;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @Column({
    type: "boolean",
    default: true,
    comment: "Whether this is the current status",
  })
  @Index()
  current: boolean;
}
