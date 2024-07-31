import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

type CancellationNoShowStatus = 'cancellation' | 'noshow';

@Entity({ name: 'winners' })
export class Winner {
    @PrimaryGeneratedColumn({ type: 'bigint'})
    id: number;

    @Column({ type: 'bigint', nullable: false, unique: false })
    raffle_id: number;

    @Column({ type: 'bigint', nullable: false, unique: false })
    entry_id: number;

    @Column({ type: 'bigint', nullable: false, unique: false })
    user_id: number;

    @Column({ type: 'int', nullable: false, unique: false })
    waiting_number: number;

    @Column({ type: 'varchar', nullable: true, unique: false })
    cancellation_noshow_status: CancellationNoShowStatus;

    @Column({ type: 'datetime', nullable: true, unique: false })
    cancellation_noshow_time: Date;

    @CreateDateColumn()
    created_date: Date;

    @UpdateDateColumn()
    updated_date: Date;
}
