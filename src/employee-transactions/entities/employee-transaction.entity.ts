import { Column, Entity, PrimaryColumn } from "typeorm";


@Entity('acc_transaction')
export class EmployeeTransaction {
    @PrimaryColumn()
    id: string;

    @Column('text')
    dept_code: string;

    @Column('text')
    dept_name: string;

    @Column('text')
    dev_alias: string;

    @Column('datetime')
    event_time: Date;

    @Column('text')
    last_name: string;

    @Column('text')
    name: string;

    @Column('text')
    pin: string;
}
