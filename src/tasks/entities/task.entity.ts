import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { type TaskPayload } from "../interfaces/index.js";
import { User } from "../../auth/entities/user.entity.js";

export enum TaskTypeEnum { movement = 'movimiento', creation = 'alta', inactivate = 'baja' }
export enum TaskStatusEnum { pending = 'pendiente', completed = 'completada', failed = 'fallida' }

@Entity()
@Index(['status', 'scheduled_at'])
@Index(['pin', 'type'], { unique: true, where: `status IN ('pendiente')` })
export class Task {
    @ApiProperty({ description: 'ID de la tarea (UUID)', format: 'uuid', example: '3f2b8c1e-6d4a-4b9e-9c1a-2e7f5d8a9b10' })
    @PrimaryGeneratedColumn('uuid') id: string;

    @ApiProperty({ description: 'Tipo de tarea programada', enum: TaskTypeEnum, example: TaskTypeEnum.movement })
    @Column({ type: 'enum', enum: TaskTypeEnum }) type: TaskTypeEnum;

    @ApiProperty({ description: 'Estado de la tarea', enum: TaskStatusEnum, example: TaskStatusEnum.pending })
    @Column({ type: 'enum', enum: TaskStatusEnum, default: TaskStatusEnum.pending }) status: TaskStatusEnum;

    @ApiProperty({ description: 'PIN (código) del empleado al que aplica la tarea', example: '10045' })
    @Column('text') pin: string;

    @ApiProperty({
        description: 'Datos a enviar a ZKBioAccess según el tipo de tarea',
        type: 'object',
        additionalProperties: true,
        example: { pin: '10045', position: 'POS-001', position_id: '4028898594b7f9660194b7fb5d7a0600', deptCode: 'PROD01', accLevelIds: '4028898594b7f9660194b7fb5d7a0430' },
    })
    @Column('jsonb') payload: TaskPayload;

    @ApiPropertyOptional({
        description: 'Datos del empleado antes del movimiento (solo en tareas de tipo movimiento)',
        type: 'object',
        additionalProperties: true,
        nullable: true,
        example: { code: '10045', position: 'Ayudante', position_id: '4028898594b7f9660194b7fb5d7a0601', department: 'Producción', deptCode: 'PROD01' },
    })
    @Column('jsonb', { nullable: true }) previous: Record<string, unknown> | null;

    @ApiProperty({ description: 'Fecha y hora programada de ejecución', type: String, format: 'date-time', example: '2026-10-21T14:00:00.000Z' })
    @Column('date') scheduled_at: Date;

    @ApiPropertyOptional({ description: 'Fecha y hora en que se ejecutó la tarea', type: String, format: 'date-time', nullable: true, example: '2026-10-21T14:00:05.000Z' })
    @Column('timestamptz', { nullable: true }) executed_at: Date | null;

    @ApiProperty({ description: 'Cantidad de intentos de ejecución', example: 0 })
    @Column('int', { default: 0 }) attempts: number;

    @ApiPropertyOptional({ description: 'Último error ocurrido al ejecutar la tarea', type: String, nullable: true, example: null })
    @Column('text', { nullable: true }) last_error: string | null;

    @ApiProperty({ description: 'ID del lote (archivo) en que se programó la tarea', example: '4028898594b7f9660194b7fb5d7a0900' })
    @Column('uuid') batch_id: string;

    @ApiProperty({ description: 'Nombre del archivo Excel de origen', example: 'movimientos_octubre.xlsx' })
    @Column('text') source_file: string;

    @ApiProperty({ description: 'Fila del archivo Excel de origen', example: '2' })
    @Column('text') source_row: string;


    @ManyToOne(() => User, { eager: true }) created_by: User;

    @ApiProperty({ description: 'Fecha de creación del registro', type: String, format: 'date-time', example: '2026-10-20T16:30:00.000Z' })
    @CreateDateColumn() created_at: Date;

    @ApiProperty({ description: 'Fecha de última actualización del registro', type: String, format: 'date-time', example: '2026-10-20T16:30:00.000Z' })
    @UpdateDateColumn() updated_at: Date;


}
