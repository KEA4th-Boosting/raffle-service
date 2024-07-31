import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'raffles' })
export class Raffle {
  @PrimaryGeneratedColumn({ type: 'bigint'})
  id: number;

  @Column({ type: 'bigint', nullable: false, unique: false })
  accommodation_id: number;

  @Column({ type: 'bigint', nullable: false, unique: false })
  room_id: number;

  @Column({ type: 'varchar', nullable: false, unique: true })
  raffle_name: string;

  @Column({ type: 'datetime', nullable: false, unique: false })
  raffle_date: Date;

  @Column({ type: 'datetime', nullable: false, unique: false })
  check_in: Date;

  @Column({ type: 'datetime', nullable: false, unique: false })
  check_out: Date;

  @Column({ type: 'int', nullable: false, unique: false })
  schedule: number;

  @Column({ type: 'int', nullable: false, unique: false, default: 0 })
  participant_cnt: number;

  @Column({ type: 'int', nullable: false, unique: false, default: 0 })
  winner_cnt: number;

  @Column({ type: 'boolean', nullable: false, unique: false, default: false })
  raffle_status: boolean;

  @Column({ type: 'int', nullable: false, unique: false, default: 0 })
  raffle_waiting_cnt: number;

  @Column({ type: 'int', nullable: true, unique: false })
  current_waiting_number: number;

  @Column({ type: 'float', nullable: false, unique: false, default: 0 })
  discount_rate: number;

  @Column({ type: 'datetime', nullable: false, unique: false })
  entry_start_date: Date;

  @Column({ type: 'datetime', nullable: false, unique: false })
  entry_end_date: Date;

  @CreateDateColumn()
  created_date: Date;

  @UpdateDateColumn()
  updated_date: Date;
}
