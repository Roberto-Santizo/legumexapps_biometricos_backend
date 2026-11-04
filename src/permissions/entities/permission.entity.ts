import { Column, CreateDateColumn, Entity, Generated, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../auth/entities/user.entity.js";

export enum PermissionTypeEnum {
    sickness = 'enfermedad',
    personal = 'personal',
    igss = 'igss',
    bereavement = 'duelo',
    other = 'otro',
}

export enum SalaryStatusEnum {
    paid = 'con_goce',
    unpaid = 'sin_goce',
    unjustified = 'falta_injustificada',
}

export enum SignerEnum {
    employee = 'employee',
    substitute = 'substitute',
    supervisor = 'supervisor',
    floor_auditor = 'floor_auditor',
    hr = 'hr',
}

@Entity()
@Index(['employee_pin', 'date'], { unique: true })
@Index(['substitute_pin', 'date'])
export class Permission {
    @PrimaryGeneratedColumn('uuid') id: string;

    @Column('int', { unique: true }) @Generated('increment') folio: number;

    // 'YYYY-MM-DD' como string para evitar corrimientos de zona horaria
    @Column('date') date: string;

    // Trabajador: FK lógica a pers_person.pin (MSSQL)
    @Column('text') employee_pin: string;
    @Column('text') employee_name: string;
    @Column('text') department_name: string;
    @Column('text', { nullable: true }) position_name: string | null;

    // Comodín: FK lógica a pers_person.pin (MSSQL)
    @Column('text', { nullable: true }) substitute_pin: string | null;
    @Column('text', { nullable: true }) substitute_name: string | null;

    @Column({ type: 'enum', enum: PermissionTypeEnum }) type: PermissionTypeEnum;
    @Column('text') reason: string;
    @Column({ type: 'enum', enum: SalaryStatusEnum }) salary_status: SalaryStatusEnum;

    @Column('time') shift_start: string;
    @Column('time') shift_end: string;

    // Firmas: keys en el disco 'private' -> 'permissions/<id>/<firmante>.png'
    @Column('text') employee_signature_key: string;
    @Column('text', { nullable: true }) substitute_signature_key: string | null;
    @Column('text') supervisor_signature_key: string;
    @Column('text') floor_auditor_signature_key: string;
    @Column('text', { nullable: true }) hr_signature_key: string | null;

    @ManyToOne(() => User, { eager: true, nullable: true }) hr_signed_by: User | null;
    @Column('timestamptz', { nullable: true }) hr_signed_at: Date | null;

    @ManyToOne(() => User, { eager: true }) created_by: User;
    @ManyToOne(() => User, { eager: true, nullable: true }) updated_by: User | null;

    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;
}
