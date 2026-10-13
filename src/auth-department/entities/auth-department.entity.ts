import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { type Employee } from "../../employees/entities/employee.entity.js";

@Entity('auth_department')
export class AuthDepartment {
    @PrimaryColumn({ type: 'varchar' })
    id: string;

    @Column('text', {
        unique: true
    })
    code: string;

    @Column()
    name: string;

    @Column('text')
    creater_name: string;

    @Column('text')
    creater_code: string;

    @Column('text')
    updater_name: string;

    @Column('text')
    updater_code: string;

    @Column('text')
    sort: string;

    @Column('text',{
        default: '4028898594b7f9660194b7fb25b00004'
    }
    )
    parent_id: string;

    @CreateDateColumn({
        default: Date.now()
    })
    create_time: Date;

    @UpdateDateColumn({
        default: Date.now()
    })
    update_time: Date;

    @OneToMany(
        "Employee",
        (employee: Employee) => employee.authDepartment,
    )
    employees: Employee[];

}
