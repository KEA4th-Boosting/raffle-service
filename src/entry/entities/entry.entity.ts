import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert,
    BeforeUpdate,
} from 'typeorm';

@Entity({ name: 'entries' })
export class Entry {
    @PrimaryGeneratedColumn({ type: 'bigint'})
    id: number;

    @Column({ type: 'bigint', nullable: false, unique: false })
    raffle_id: number;

    @Column({ type: 'bigint', nullable: false, unique: false })
    user_id: number;

    @Column({ type: 'int', nullable: false, unique: false, default: 100 })
    raffle_index: number

    @CreateDateColumn()
    created_date: Date;

    @UpdateDateColumn()
    updated_date: Date;

    @BeforeInsert()
    setUpdatedDateBeforeInsert() {
        this.updated_date = this.created_date;
    }

    @BeforeUpdate()
    setUpdatedDateBeforeUpdate() {
        this.updated_date = new Date();
    }
}
