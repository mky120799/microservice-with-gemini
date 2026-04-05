import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  ticketId!: number;

  @Column()
  changedByUserId!: number;

  @Column()
  fieldChanged!: string;

  @Column({ nullable: true })
  oldValue!: string;

  @Column({ nullable: true })
  newValue!: string;

  @CreateDateColumn()
  timestamp!: Date;
}
