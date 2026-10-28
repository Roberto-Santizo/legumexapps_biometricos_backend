import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('iclock_terminal')
export class Terminal{
    @PrimaryColumn()
    id: number;

    @Column('text')
    alias: string;

    @Column('int')
    user_count: number;

    @Column('int')
    user_capacity: number;

    @Column('int')
    area_id: number;
}