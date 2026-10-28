import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { type EmployeesFinca } from "./employees-finca.entity.js";

@Entity('personnel_resign')
export class EmployeeResign {
    @PrimaryColumn()
    id: number;

    @Column('date')
    resign_date: Date;

    @Column('id')
    employee_id: number;

    @OneToOne(
        "EmployeesFinca",
        (employee: EmployeesFinca) => employee.resign
    )
    @JoinColumn({ 'name': "employee_id" })
    employee: EmployeesFinca;

}