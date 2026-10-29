import { ApiProperty, ApiPropertyOptional, getSchemaPath } from "@nestjs/swagger";
import { Column, Entity, OneToOne, PrimaryColumn } from "typeorm";
import { type Employee } from "../../employees/entities/employee.entity.js";

@Entity('pers_position')
export class Position {
    @ApiProperty({
        description: 'ID de la posición (32 caracteres)',
        example: '4028898594b7f9660194b7fb5d7a0600',
    })
    @PrimaryColumn()
    id: string;

    @ApiProperty({ description: 'Código único de la posición', example: 'POS-001' })
    @Column('text', { unique: true }) code: string;

    @ApiProperty({ description: 'Nombre de la posición', example: 'Operario de campo' })
    @Column('text') name: string;

    @ApiProperty({ description: 'Orden de la posición', example: 1 })
    @Column('integer') sort: number;

    @ApiProperty({ description: 'ID de la empresa', example: 1 })
    @Column('integer') company_id: number;

    @ApiProperty({ description: 'Fecha de creación', type: Date, example: '2026-10-15T14:30:00.000Z' })
    @Column('timestamp') create_time: Date;

    @ApiProperty({ description: 'Correo del usuario que creó el registro', example: 'juan.perez@legumex.com' })
    @Column('text') creater_code: string;

    @ApiProperty({ description: 'Nombre del usuario que creó el registro', example: 'Juan Pérez López' })
    @Column('text') creater_name: string;

    @ApiProperty({ description: 'Fecha de última actualización', type: Date, example: '2026-10-15T14:30:00.000Z' })
    @Column('timestamp') update_time: Date;

    @ApiProperty({ description: 'Correo del último usuario que actualizó el registro', example: 'juan.perez@legumex.com' })
    @Column('text') updater_code: string;

    @ApiProperty({ description: 'Nombre del último usuario que actualizó el registro', example: 'Juan Pérez López' })
    @Column('text') updater_name: string;

    @ApiPropertyOptional({
        description: 'Empleado asignado a la posición (null si no tiene)',
        allOf: [{ $ref: getSchemaPath('Employee') }],
        nullable: true,
    })
    @OneToOne(
        'Employee',
        (employee: Employee) => employee.position,
        { eager: true }
    )
    employee?: Employee;
}
