import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { EmployeesFinca } from "../../employees-finca/entities/employees-finca.entity.js";

@Entity('personnel_position')
export class PositionFinca {
    @ApiProperty({
        description: 'ID de la posición',
        example: 1,
    })
    @PrimaryGeneratedColumn('increment')
    id: number;

    @ApiProperty({
        description: 'Código único de la posición',
        example: 'SUP-01',
    })
    @Column('text')
    position_code: string;

    @ApiProperty({
        description: 'Nombre de la posición',
        example: 'Supervisor de campo',
    })
    @Column('text')
    position_name: string;

    @ApiProperty({
        description: 'Indica si es la posición por defecto (1 = sí, 0 = no)',
        example: 0,
    })
    @Column('int')
    is_default: number;

    @ApiProperty({
        description: 'ID de la compañía',
        example: 1,
    })
    @Column('int')
    company_id: number;

    @ApiProperty({
        description: 'ID de la posición padre',
        example: 1,
    })
    @Column('int')
    parent_position_id: number;

    @OneToMany(
        'EmployeesFinca',
        (employees: EmployeesFinca) => employees.position
    )
    employees: EmployeesFinca[];
}
