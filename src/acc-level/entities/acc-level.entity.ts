import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { AccLevelDoor } from "./acc_level_door.entity.js";
import { AccLevelEmployee } from "./acc_level_employee.js";


@Entity('acc_level')
export class AccLevel {

    @ApiProperty({
        description: 'ID del nivel de acceso (32 caracteres)',
        example: '4028898594b7f9660194b7fb5d7a0430',
    })
    @PrimaryColumn()
    id: string;

    @ApiProperty({
        description: 'Nombre del nivel de acceso',
        example: 'Acceso general',
    })
    @Column('text')
    name: string;

    @ApiProperty({
        description: 'ID del horario (time segment) asociado al nivel',
        example: '4028898594b7f9660194b7fb5d7a0430',
    })
    @Column('text')
    timeseg_id: string;

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
        description: 'Nombre del último usuario que actualizó el registro',
        example: 'Juan Pérez López',
    })
    @Column('text')
    updater_name: string;

    @ApiProperty({
        description: 'Correo del último usuario que actualizó el registro',
        example: 'juan.perez@legumex.com',
    })
    @Column('text')
    updater_code: string;

    @ApiProperty({
        description: 'Fecha de creación',
        type: Date,
        example: '2026-10-15T14:30:00.000Z',
    })
    @Column('datetime')
    create_time: Date;

    @ApiProperty({
        description: 'Fecha de última actualización',
        type: Date,
        example: '2026-10-15T14:30:00.000Z',
    })
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
