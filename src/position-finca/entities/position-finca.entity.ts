import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { EmployeesFinca } from "../../employees-finca/entities/employees-finca.entity.js";

@Entity('personnel_position')
export class PositionFinca {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column('text')
    position_code: string;

    @Column('text')
    position_name: string;

    @Column('int')
    is_default: number;

    @Column('int')
    company_id: number;

    @Column('int')
    parent_position_id: number;

    @OneToMany(
        'EmployeesFinca',
        (employees: EmployeesFinca) => employees.position
    )
    employees: EmployeesFinca[];
}
