import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { AccLevelDoor } from "./acc_level_door.entity.js";
import { AccLevelEmployee } from "./acc_level_employee.js";


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

    @OneToMany(
        () => AccLevelDoor,
        accLevelDoor => accLevelDoor.accLevel
    )
    accLevelDoors: AccLevelDoor[];

    @OneToMany(
        () => AccLevelEmployee,
        accLevelEmployee => accLevelEmployee.employee
    )

    accLevelEmployee: AccLevelEmployee[];
}
