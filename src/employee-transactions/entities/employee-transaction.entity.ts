import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryColumn } from "typeorm";


@Entity('acc_transaction')
export class EmployeeTransaction {
    @ApiProperty({
        description: 'ID de la transacción',
        example: '4028898594b7f9660194b7fb5d7a0700',
    })
    @PrimaryColumn()
    id: string;

    @ApiProperty({
        description: 'Código del departamento del empleado',
        example: '1',
    })
    @Column('text')
    dept_code: string;

    @ApiProperty({
        description: 'Nombre del departamento del empleado',
        example: 'Producción',
    })
    @Column('text')
    dept_name: string;

    @ApiProperty({
        description: 'Alias del dispositivo donde se registró la transacción',
        example: 'Entrada Planta 1',
    })
    @Column('text')
    dev_alias: string;

    @ApiProperty({
        description: 'Fecha y hora del evento',
        type: String,
        format: 'date-time',
        example: '2026-10-15T14:30:00.000Z',
    })
    @Column('datetime')
    event_time: Date;

    @ApiProperty({
        description: 'Apellidos del empleado',
        example: 'Pérez López',
    })
    @Column('text')
    last_name: string;

    @ApiProperty({
        description: 'Nombre del empleado',
        example: 'Juan Carlos',
    })
    @Column('text')
    name: string;

    @ApiProperty({
        description: 'PIN (código) del empleado en ZKBioAccess',
        example: '10045',
    })
    @Column('text')
    pin: string;
}
