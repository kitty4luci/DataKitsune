import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { LinkEntity } from "./link.entity";

@Entity("description")
export class DescriptionEntity {
  @PrimaryGeneratedColumn({ type: "integer" })
  id: number;

  @Column({
    type: "varchar",
    length: 4096,
    nullable: false,
  })
  description: string;

  @OneToOne(() => LinkEntity, (link) => link.description)
  @JoinColumn()
  link: LinkEntity;

  @Column({
    type: "integer",
    nullable: false,
  })
  linkId: number;
}
