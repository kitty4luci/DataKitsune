import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";
import { LinkWithDescription } from "../dtos/messenger.type";

@Entity("update_pagination")
export class UpdatePaginationEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", nullable: false })
  messenger: string;

  @Column({ type: "varchar", nullable: false })
  userId: string;

  @Column({ type: "varchar", nullable: false })
  chatId: string;

  @Index("IDX_update_pagination_message_id")
  @Column({ type: "varchar", nullable: false })
  messageId: string;

  @Column({ type: "jsonb", nullable: false })
  links: LinkWithDescription[];

  @Column({ type: "int", nullable: false, default: 1 })
  totalPages: number;

  @Column({ type: "int", nullable: false, default: 1 })
  currentPage: number;

  @CreateDateColumn()
  createdAt: Date;
}
