import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { AuthDepartment } from "../../auth-department/entities/auth-department.entity.js";

@Entity('pers_leaveperson')
export class InactiveEmployee {
    @PrimaryColumn()
    id: string;

    @Column('text')
    pin: string;

    @Column('text')
    name: string;

    @Column('text')
    last_name: string;

    @Column('datetime')
    leave_date: Date;

    @Column('int')
    leavetype_id: string;

    @Column('text')
    creater_code: string;

    @Column('text')
    creater_name: string;

    @Column('text')
    updater_name: string;

    @Column('text')
    updater_code: string;

    @Column('text')
    auth_dept_code: string;

    @Column('text')
    auth_dept_id: string;

    @Column('text')
    auth_dept_name: string;

    @Column('datetime')
    create_time: Date;

    @ManyToOne(
        () => AuthDepartment,
        authDepartment => authDepartment.inactiveEmployees,
        { eager: true }
    )
    @JoinColumn({ name: 'auth_dept_id' })
    authDepartment: AuthDepartment;
}
