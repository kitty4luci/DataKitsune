import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity("chat_schedules")
@Index(["messenger", "actorId"], { unique: true })
export class ChatSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, length: 32 })
  @Index()
  messenger: string;

  @Column({ nullable: false, length: 128 })
  @Index()
  actorId: string;

  @Column({ nullable: false, type: "smallint" })
  hour: number;

  @Column({ nullable: false, type: "smallint" })
  minute: number;

  @Column({ nullable: false, default: 0, type: "smallint" })
  timezoneOffset: number;

  @Column({ nullable: false, default: true })
  @Index()
  enabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
