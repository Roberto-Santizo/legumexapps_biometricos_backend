import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { type TaskPayload } from "../interfaces/index.js";
import { User } from "../../auth/entities/user.entity.js";

export enum TaskTypeEnum { movement = 'movimiento', creation = 'alta', inactivate = 'baja' }
export enum TaskStatusEnum { pending = 'pendiente', completed = 'completada', failed = 'fallida' }

@Entity()
@Index(['status', 'scheduled_at'])
@Index(['pin', 'type'], { unique: true, where: `status IN ('pendiente')` })
export class Task {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column({ type: 'enum', enum: TaskTypeEnum }) type: TaskTypeEnum;
    @Column({ type: 'enum', enum: TaskStatusEnum, default: TaskStatusEnum.pending }) status: TaskStatusEnum;
    @Column('text') pin: string;
    @Column('jsonb') payload: TaskPayload;
    @Column('jsonb', { nullable: true }) previous: Record<string, unknown> | null;
    @Column('timestamptz') scheduled_at: Date;
    @Column('timestamptz', { nullable: true }) executed_at: Date | null;
    @Column('int', { default: 0 }) attempts: number;
    @Column('text', { nullable: true }) last_error: string | null;
    @Column('uuid') batch_id: string;
    @Column('text') source_file: string;
    @Column('text') source_row: string;


    @ManyToOne(() => User, { eager: true }) created_by: User;

    @CreateDateColumn() created_at: Date;
    @UpdateDateColumn() updated_at: Date;


}
