import { ApiProperty } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { type Employee } from "../../employees/entities/employee.entity.js";
import { InactiveEmployee } from "../../inactive-employees/entities/inactive-employee.entity.js";

@Entity('auth_department')
export class AuthDepartment {
    @ApiProperty({
        description: 'ID del departamento (32 caracteres)',
        example: '4028898594b7f9660194b7fb25b00010',
    })
    @PrimaryColumn({ type: 'varchar' })
    id: string;

    @ApiProperty({
        description: 'Código único del departamento',
        example: 'PROD01',
    })
    @Column('text', {
        unique: true
    })
    code: string;

    @ApiProperty({
        description: 'Nombre del departamento',
        example: 'Producción',
    })
    @Column()
    name: string;

    @ApiProperty({
        description: 'Nombre del usuario que creó el registro',
        example: 'Juan Pérez López',
    })
    @Column('text')
    creater_name: string;

    @ApiProperty({
        description: 'Código del usuario que creó el registro',
        example: 'Juan Pérez López',
    })
    @Column('text')
    creater_code: string;

    @ApiProperty({
        description: 'Nombre del último usuario que actualizó el registro',
        example: 'Juan Pérez López',
    })
    @Column('text')
    updater_name: string;

    @ApiProperty({
        description: 'Código del último usuario que actualizó el registro',
        example: 'Juan Pérez López',
    })
    @Column('text')
    updater_code: string;

    @ApiProperty({
        description: 'Orden de visualización',
        example: '99999',
    })
    @Column('text')
    sort: string;

    @ApiProperty({
        description: 'ID del departamento padre',
        example: '4028898594b7f9660194b7fb25b00004',
    })
    @Column('text', {
        default: '4028898594b7f9660194b7fb25b00004'
    }
    )
    parent_id: string;

    @ApiProperty({
        description: 'Fecha de creación',
        type: Date,
        example: '2026-10-15T14:30:00.000Z',
    })
    @CreateDateColumn({
        default: Date.now()
    })
    create_time: Date;

    @ApiProperty({
        description: 'Fecha de última actualización',
        type: Date,
        example: '2026-10-15T14:30:00.000Z',
    })
    @UpdateDateColumn({
        default: Date.now()
    })
    update_time: Date;

    @OneToMany(
        "Employee",
        (employee: Employee) => employee.authDepartment,
    )
    employees: Employee[];

    @OneToMany(
        "InactiveEmployee",
        (inactiveEmployee: InactiveEmployee) => inactiveEmployee.authDepartment,
    )
    inactiveEmployees: InactiveEmployee[];

}
