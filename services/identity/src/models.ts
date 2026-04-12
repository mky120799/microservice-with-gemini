import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ default: 'user' }) // 'admin', 'user', 'auditor'
  role!: string;

  @Column({ nullable: true })
  twoFactorSecret!: string;

  @Column({ default: false })
  isTwoFactorEnabled!: boolean;

  @Column({ nullable: true })
  socialId!: string;

  @Column({ nullable: true })
  socialProvider!: string;

  @Column({ nullable: true })
  googleId!: string;

  @Column({ nullable: true })
  resetToken!: string;

  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpiry!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
