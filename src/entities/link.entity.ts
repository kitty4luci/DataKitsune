import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { DescriptionEntity } from "./description.entity";
import { ContentEntity } from "./content.entity";

@Entity("link")
@Index(["messenger", "contextId", "messageId"], { unique: true })
export class LinkEntity {
  @PrimaryGeneratedColumn({ type: "integer" })
  id: number;

  @Column({
    type: "varchar",
    length: 32,
    nullable: false,
    comment: "Source messenger: TELEGRAM, DISCORD, SLACK",
  })
  messenger: string;

  @Column({
    type: "varchar",
    length: 64,
    nullable: false,
    comment: "Original message ID from the messenger",
  })
  messageId: string;

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
    type: "varchar",
    length: 2048,
    nullable: false,
  })
  url: string;

  @OneToOne(() => ContentEntity, (content) => content.link, {
    nullable: true,
  })
  content: ContentEntity;

  @OneToOne(() => DescriptionEntity, (description) => description.link, {
    nullable: true,
  })
  description: DescriptionEntity;

  @Column({
    type: "jsonb",
    nullable: true,
  })
  raw: any;

  @CreateDateColumn()
  addedAt: Date;
}
