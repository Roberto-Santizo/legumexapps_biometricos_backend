import { Column, Entity, OneToOne, PrimaryColumn } from "typeorm";
import { type Employee } from "../../employees/entities/employee.entity.js";

@Entity('pers_position')
export class Position {
    @PrimaryColumn()
    id: string;

    @Column('text', { unique: true }) code: string;
    @Column('text') name: string;
    @Column('integer') sort: number;
    @Column('integer') company_id: number;

    @Column('timestamp') create_time: Date;
    @Column('text') creater_code: string;
    @Column('text') creater_name: string;
    @Column('timestamp') update_time: Date;
    @Column('text') updater_code: string;
    @Column('text') updater_name: string;

    @OneToOne(
        'Employee',
        (employee: Employee) => employee.position,
        { eager: true }
    )
    employee?: Employee;
}
