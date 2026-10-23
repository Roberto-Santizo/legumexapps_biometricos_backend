import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('personnel_employee')
export class EmployeesFinca {
    @PrimaryColumn()
    id: number;

    @Column('int')
    emp_code: number;

    @Column('text')
    first_name: string;

    @Column('text')
    last_name: string;

    @Column('int')
    company_id: number;

    @Column('int')
    department_id: number;

    @Column('int')
    position_id: number;
}
