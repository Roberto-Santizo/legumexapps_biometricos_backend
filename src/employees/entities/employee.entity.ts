import { AccLevelEmployee } from '../../acc-level/entities/acc_level_employee.js';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthDepartment } from '../../auth-department/entities/auth-department.entity.js';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Position } from '../../position/entities/position.entity.js';

@Entity('pers_person')
export class Employee {
  @ApiProperty({
    description: 'ID del empleado (32 caracteres)',
    example: '4028898594b7f9660194b7fb5d7a0500',
  })
  @PrimaryColumn({
    type: 'varchar',
    length: 32,
  })
  id: string;

  @ApiProperty({
    description: 'Nombre del empleado',
    example: 'Juan Carlos',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Apellidos del empleado',
    example: 'Pérez López',
  })
  @Column()
  last_name: string;

  @ApiProperty({
    description: 'PIN (código) del empleado en ZKBioAccess',
    example: '10045',
  })
  @Column()
  pin: string;

  @ApiProperty({
    description: 'ID del departamento del empleado',
    example: '4028898594b7f9660194b7fb25b00010',
  })
  @Column()
  auth_dept_id: string;

  @ApiPropertyOptional({
    description: 'ID de la posición asignada al empleado',
    example: '4028898594b7f9660194b7fb5d7a0600',
  })
  @Column()
  position_id?: string;

  @ApiProperty({
    description: 'Indica si la credencial está habilitada (1) o no (0)',
    example: 1,
  })
  @Column('integer')
  enabled_credential: number;

  @ApiProperty({
    description: 'Bandera de excepción de ZKBioAccess',
    example: 0,
  })
  @Column('integer')
  exception_flag: number;

  @ApiProperty({
    description: 'Indica si el empleado tiene autorización en la app (1) o no (0)',
    example: 0,
  })
  @Column('integer')
  app_authorization: number;

  @ApiProperty({
    description: 'Estado del empleado en ZKBioAccess',
    example: 0,
  })
  @Column('integer')
  status: number;

  @ApiProperty({
    description: 'Tipo de persona en ZKBioAccess',
    example: 0,
  })
  @Column('integer')
  person_type: number;

  @ApiProperty({
    description: 'Ruta de la foto del empleado',
    example: 'upload/pers/user/avatar/10045.jpg',
  })
  @Column()
  photo_path: string;

  @ApiProperty({
    description: 'Nombre del usuario que creó el registro',
    example: 'Juan Pérez López',
  })
  @Column('text')
  creater_name: string;

  @ApiProperty({
    description: 'Código del usuario que creó el registro',
    example: 'Juan Pérez López',
  })
  @Column('text')
  creater_code: string;

  @ApiProperty({
    description: 'Nombre del último usuario que actualizó el registro',
    example: 'Juan Pérez López',
  })
  @Column('text')
  updater_name: string;

  @ApiProperty({
    description: 'Código del último usuario que actualizó el registro',
    example: 'Juan Pérez López',
  })
  @Column('text')
  updater_code: string;

  @ApiProperty({
    description: 'Fecha de creación',
    type: Date,
    example: '2026-10-15T14:30:00.000Z',
  })
  @CreateDateColumn({
    default: Date.now()
  })
  create_time: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    type: Date,
    example: '2026-10-15T14:30:00.000Z',
  })
  @UpdateDateColumn({
    default: Date.now()
  })
  update_time: Date;

  @ApiProperty({
    description: 'Departamento al que pertenece el empleado',
    type: () => AuthDepartment,
  })
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

  @ApiPropertyOptional({
    description: 'Posición asignada al empleado',
    type: () => Position,
  })
  @OneToOne(
    () => Position,
    position => position.employee,
  )
  @JoinColumn({ name: 'position_id' })
  position?: Position;
}
