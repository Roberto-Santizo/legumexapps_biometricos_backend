import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AreaFincaEmployee } from "./area-finca-employee.js";

@Entity('personnel_area')
export class AreaFinca {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column('text')
    area_code: string;

    @Column('text')
    area_name: string;

    @Column('int')
    is_default: number;

    @Column('int')
    company_id: number;

    @Column('int')
    parent_area_id: number;

    @OneToMany(
        () => AreaFincaEmployee,
        (areaFincaEmployee) => areaFincaEmployee.area
    )
    employees: AreaFincaEmployee[];
}
