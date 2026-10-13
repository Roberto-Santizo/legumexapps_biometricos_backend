import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

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
}
