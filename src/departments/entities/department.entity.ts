import { Column, Entity, PrimaryColumn } from "typeorm";

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
}
