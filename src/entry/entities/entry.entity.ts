import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'entries' })
export class Entry {
    @PrimaryGeneratedColumn({ type: 'bigint'})
    id: number;

    @Column({ type: 'bigint', nullable: false, unique: false })
    raffle_id: number;

    @Column({ type: 'bigint', nullable: false, unique: false })
    user_id: number;

    @CreateDateColumn()
    created_date: Date;

    @UpdateDateColumn()
    updated_date: Date;
}
