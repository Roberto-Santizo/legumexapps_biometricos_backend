import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { type AreaFinca } from "./area-finca.entity.js";
import { type EmployeesFinca } from "../../employees-finca/entities/employees-finca.entity.js";

@Entity('personnel_employee_area')
export class AreaFincaEmployee {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column('int')
    employee_id: number;

    @Column('int')
    area_id: number;

    @ManyToOne(
        'AreaFinca',
        (areaFinca: AreaFinca) => areaFinca.employees,
        {eager: true}
    )
    @JoinColumn({ name: 'area_id' })
    area: AreaFinca;
   
    @ManyToOne(
        'EmployeesFinca',
        (employee: EmployeesFinca) => employee.areas
    )
    @JoinColumn({ name: 'employee_id' })
    employee: EmployeesFinca;
}