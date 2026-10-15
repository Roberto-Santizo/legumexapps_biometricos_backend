import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { type AccLevel } from "./acc-level.entity.js";
import { AccDoor } from "./acc_door.entity.js";


@Entity('acc_level_door')
export class AccLevelDoor {
    @PrimaryColumn()
    id: string;

    @Column('text')
    door_id: string;

    @Column('text')
    level_id: string;

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

    @OneToOne(
        "AccLevel",
        (accLevel: AccLevel) => accLevel.accLevelDoors
    )
    @JoinColumn({ name: 'level_id' })
    accLevel: AccLevel;

    @OneToOne(
        "AccDoor",
        (accDoor: AccDoor) => accDoor.accLevelDoors,
        { eager: true }
    )
    @JoinColumn({ name: 'door_id' })
    accDoor: AccDoor;
}