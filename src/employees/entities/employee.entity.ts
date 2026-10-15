import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { AuthDepartment } from '../../auth-department/entities/auth-department.entity.js';
import { AccLevelEmployee } from '../../acc-level/entities/acc_level_employee.js';

@Entity('pers_person')
export class Employee {
  @PrimaryColumn({
    type: 'varchar',
    length: 32,
  })
  id: string;

  @Column()
  name: string;

  @Column()
  last_name: string;

  @Column()
  pin: string;

  @Column()
  auth_dept_id: string;

  @Column('integer')
  enabled_credential: number;

  @Column('integer')
  exception_flag: number;

  @Column('integer')
  app_authorization: number;

  @Column('integer')
  status: number;
  
  @Column('integer')
  person_type: number;

  @Column()
  photo_path: string;

  @Column('text')
  creater_name: string;

  @Column('text')
  creater_code: string;

  @Column('text')
  updater_name: string;

  @Column('text')
  updater_code: string;

  @CreateDateColumn({
    default: Date.now()
  })
  create_time: Date;

  @UpdateDateColumn({
    default: Date.now()
  })
  update_time: Date;

  @ManyToOne(
    () => AuthDepartment,
    authDepartment => authDepartment.employees,
    { eager: true }
  )
  @JoinColumn({ name: 'auth_dept_id' })
  authDepartment: AuthDepartment;

  @OneToMany(
    () => AccLevelEmployee,
    accLevelEmployee => accLevelEmployee.employee
  )

  accLevelEmployee: AccLevelEmployee[];
}
