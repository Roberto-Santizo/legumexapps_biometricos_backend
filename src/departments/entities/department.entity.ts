import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { EmployeesFinca } from "../../employees-finca/entities/employees-finca.entity.js";

@Entity('personnel_department')
export class Department {
    @ApiProperty({
        description: 'ID del departamento',
        example: 1,
    })
    @PrimaryColumn()
    id: number;

    @ApiProperty({
        description: 'Código único del departamento',
        example: 'RRHH',
    })
    @Column('text')
    dept_code: string;

    @ApiProperty({
        description: 'Nombre del departamento',
        example: 'Recursos Humanos',
    })
    @Column('text')
    dept_name: string;

    @ApiProperty({
        description: 'ID de la empresa a la que pertenece el departamento',
        example: 1,
    })
    @Column('int')
    company_id: number;

    @OneToMany(
        'EmployeesFinca',
        (employees: EmployeesFinca) => employees.department
    )
    employees: EmployeesFinca[];
}
