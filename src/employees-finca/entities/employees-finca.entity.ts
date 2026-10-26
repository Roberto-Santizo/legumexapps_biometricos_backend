import { Column, Entity, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { Department } from "../../departments/entities/department.entity.js";
import { PositionFinca } from '../../position-finca/entities/position-finca.entity.js';

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

    @ManyToOne(
        () => Department,
        department => department.employees,
        { eager: true }
    )
    @JoinColumn({ name: 'department_id' })
    department: Department;

    @ManyToOne(
        () => PositionFinca,
        position => position.employees,
        { eager: true }
    )
    @JoinColumn({ name: 'position_id' })
    position: PositionFinca;
}
