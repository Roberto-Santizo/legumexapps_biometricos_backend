import { Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { type AccDoor } from './acc_door.entity.js';


@Entity('acc_device')
export class AccDevice {
    @PrimaryColumn()
    id: string;

    @Column('smallint')
    acpanel_type: number;

    @Column('text')
    dev_alias: string;

    @Column('smallint')
    comm_type: number;

    @Column('bit')
    enabled: number;

    @Column('bit')
    is_registrationdevice: number;

    @Column('smallint')
    machine_type: number;

    @Column('text')
    sn: string;

    @Column('text')
    ip_address: string;

    @OneToOne(
        "AccDoor",
        (accDoor: AccDoor) => accDoor.device
    )
    door: AccDoor;
}