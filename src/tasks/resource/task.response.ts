import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { TaskStatusEnum, TaskTypeEnum } from "../entities/task.entity.js";
import { type TaskPayload, TaskResourceInterface } from "../interfaces/index.js";

export class TaskResponse implements TaskResourceInterface {
    @ApiProperty({
        description: 'ID de la tarea (UUID)',
        format: 'uuid',
        example: '3f2b8c1e-6d4a-4b9e-9c1a-2e7f5d8a9b10',
    })
    id: string;

    @ApiProperty({
        description: 'Tipo de tarea programada',
        enum: TaskTypeEnum,
        example: TaskTypeEnum.movement,
    })
    type: string;

    @ApiProperty({
        description: 'Estado de la tarea',
        enum: TaskStatusEnum,
        example: TaskStatusEnum.pending,
    })
    status: string;

    @ApiProperty({
        description: 'PIN (código) del empleado al que aplica la tarea',
        example: '10045',
    })
    pin: string;

    @ApiProperty({
        description: 'Datos a enviar a ZKBioAccess. Según el tipo: alta { pin, name, lastName, deptCode, accLevelIds }, movimiento { pin, position, deptCode, accLevelIds } o baja { pin, leaveType, leaveDate }',
        type: 'object',
        additionalProperties: true,
        example: { pin: '10045', position: 'Operario', deptCode: 'PROD01', accLevelIds: '4028898594b7f9660194b7fb5d7a0430' },
    })
    payload: TaskPayload;

    @ApiPropertyOptional({
        description: 'Datos del empleado antes del movimiento (solo en tareas de tipo movimiento)',
        type: 'object',
        additionalProperties: true,
        nullable: true,
        example: { code: '10045', position: 'Ayudante', department: 'Producción', deptCode: 'PROD01' },
    })
    previous: Record<string, unknown> | null;

    @ApiProperty({
        description: 'Fecha y hora programada de ejecución (dd-MM-yyyy HH:mm:ss)',
        example: '21-10-2026 08:00:00',
    })
    scheduled_at: string;

    @ApiProperty({
        description: 'Nombre del usuario que programó la tarea',
        example: 'Juan Pérez López',
    })
    created_by: string;
}
