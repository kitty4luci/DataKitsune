import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity("chat_subscriptions")
@Index(["messenger", "enabled", "contextId", "actorId"], { unique: true })
export class ChatSubscription {
  @PrimaryGeneratedColumn({ type: "integer" })
  id: number;

  @Column({
    type: "varchar",
    length: 32,
    nullable: false,
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
    nullable: false,
    comment: "User ID who created the subscription",
  })
  actorId: string;

  @Column({
    type: "varchar",
    length: 128,
    nullable: true,
    comment: "Username who created the subscription",
  })
  actorUsername: string;

  @Column({
    type: "boolean",
    default: true,
    comment: "Whether this subscription is enabled",
  })
  @Index()
  enabled: boolean;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;
}
