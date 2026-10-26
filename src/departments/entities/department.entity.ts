import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { EmployeesFinca } from "../../employees-finca/entities/employees-finca.entity.js";

@Entity('personnel_department')
export class Department {
    @PrimaryColumn()
    id: number;

    @Column('text')
    dept_code: string;

    @Column('text')
    dept_name: string;

    @Column('int')
    company_id: number;

    @OneToMany(
        'EmployeesFinca',
        (employees: EmployeesFinca) => employees.department
    )
    employees: EmployeesFinca[];
}
