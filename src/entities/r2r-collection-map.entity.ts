import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("r2r_collection_map")
@Index(["messenger", "contextId"], { unique: true })
@Index(["messenger", "contextId", "collectionId"])
export class R2rCollectionMapEntity {
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
    length: 128,
    nullable: false,
    comment: "Chat/Channel/Group ID from the messenger",
  })
  contextId: string;

  @Column({
    type: "uuid",
    nullable: false,
    comment: "R2R document ID",
  })
  collectionId: string;
}
