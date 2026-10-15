import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { type Employee } from "../../employees/entities/employee.entity.js";
import { type AccLevel } from "./acc-level.entity.js";

@Entity('acc_level_person')
export class AccLevelEmployee {
    @PrimaryColumn()
    id: string;

    @Column('datetime')
    create_time: Date;

    @Column('text')
    creater_code: string;

    @Column('text')
    creater_name: string;

    @Column('datetime')
    update_time: Date;

    @Column('text')
    updater_code: string;

    @Column('text')
    updater_name: string;

    @Column('text')
    pers_person_id: string;

    @Column('text')
    level_id: string;

    @OneToOne(
        "Employee",
        (employee: Employee) => employee.accLevelEmployee,
    )
    @JoinColumn({ name: 'pers_person_id' })
    employee: Employee;

    @OneToOne(
        "AccLevel",
        (accLevel: AccLevel) => accLevel.accLevelEmployee,
        { eager: true }
    )
    @JoinColumn({ name: 'level_id' })
    accLevel: AccLevel;

}