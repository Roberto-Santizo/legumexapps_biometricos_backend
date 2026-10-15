import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from "typeorm";
import { type AccLevel } from "./acc-level.entity.js";
import { AccDoor } from "./acc_door.entity.js";


@Entity('acc_level_door')
export class AccLevelDoor {
    @ApiProperty({
        description: 'ID de la asignación puerta-nivel (32 caracteres)',
        example: '4028898594b7f9660194b7fb5d7a0431',
    })
    @PrimaryColumn()
    id: string;

    @ApiProperty({
        description: 'ID de la puerta',
        example: '4028898594b7f9660194b7fb5d7a0432',
    })
    @Column('text')
    door_id: string;

    @ApiProperty({
        description: 'ID del nivel de acceso',
        example: '4028898594b7f9660194b7fb5d7a0430',
    })
    @Column('text')
    level_id: string;

    @ApiProperty({
        description: 'Fecha de creación',
        type: Date,
        example: '2026-10-15T14:30:00.000Z',
    })
    @Column('datetime')
    create_time: Date;

    @ApiProperty({
        description: 'Correo del usuario que creó el registro',
        example: 'juan.perez@legumex.com',
    })
    @Column('text')
    creater_code: string;

    @ApiProperty({
        description: 'Nombre del usuario que creó el registro',
        example: 'Juan Pérez López',
    })
    @Column('text')
    creater_name: string;

    @ApiProperty({
        description: 'Fecha de última actualización',
        type: Date,
        example: '2026-10-15T14:30:00.000Z',
    })
    @Column('datetime')
    update_time: Date;

    @ApiProperty({
        description: 'Correo del último usuario que actualizó el registro',
        example: 'juan.perez@legumex.com',
    })
    @Column('text')
    updater_code: string;

    @ApiProperty({
        description: 'Nombre del último usuario que actualizó el registro',
        example: 'Juan Pérez López',
    })
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