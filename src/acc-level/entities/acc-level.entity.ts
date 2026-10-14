import { Column, Entity, PrimaryColumn } from "typeorm";


@Entity('acc_level')
export class AccLevel {

    @PrimaryColumn()
    id: string;

    @Column('text')
    name: string;

    @Column('text')
    timeseg_id: string;

    @Column('text')
    creater_code: string;

    @Column('text')
    creater_name: string;
   
    @Column('text')
    updater_name: string;

    @Column('text')
    updater_code: string;

    @Column('datetime')
    create_time: Date;

    @Column('datetime')
    update_time: Date;
}
