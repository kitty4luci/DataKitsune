import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { LinkEntity } from "./link.entity";

@Entity("content")
export class ContentEntity {
  @PrimaryGeneratedColumn({ type: "integer" })
  id: number;

  @Column({
    type: "varchar",
    length: 2048,
    nullable: true,
  })
  title: string;

  @Column({
    type: "text",
    nullable: false,
  })
  content: string;

  @Column({
    type: "varchar",
    length: 8,
    nullable: true,
  })
  language: string;

  @OneToOne(() => LinkEntity, (link) => link.description)
  @JoinColumn()
  link: LinkEntity;

  @Column({
    type: "integer",
    nullable: false,
  })
  linkId: number;
}
