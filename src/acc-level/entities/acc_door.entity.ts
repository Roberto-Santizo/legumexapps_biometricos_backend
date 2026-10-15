import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import { AccDevice } from "./acc_device.entity.js";
import { AccLevelDoor } from "./acc_level_door.entity.js";


@Entity('acc_door')
export class AccDoor {
    @PrimaryColumn()
    id: string;

    @Column('smallint')
    action_interval: number;

    @Column('bit')
    back_lock: number;

    @Column('smallint')
    lock_delay: number;

    @Column('text')
    name: string;

    @Column('smallint')
    verify_mode: number;

    @Column('text')
    dev_id: string;

    @OneToOne(
        () => AccDevice,
        accDevice => accDevice.door,
        { eager: true }
    )
    @JoinColumn({ name: "dev_id" })
    device: AccDevice;

    @OneToMany(
        () => AccLevelDoor,
        accLevelDoor => accLevelDoor.accLevel
    )
    accLevelDoors: AccLevelDoor[];
}