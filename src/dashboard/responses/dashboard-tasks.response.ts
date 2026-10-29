import { ApiProperty } from "@nestjs/swagger";
import { TaskStatusEnum, TaskTypeEnum } from "../../tasks/entities/task.entity.js";
import {
    DashboardTasksInterface,
    TaskStatusCountInterface,
    TaskSummaryInterface,
    TaskTypeCountInterface,
} from "../interfaces/index.js";

export class TaskStatusCountResponse implements TaskStatusCountInterface {
    @ApiProperty({ description: 'Tareas pendientes', example: 12 })
    pendiente: number;

    @ApiProperty({ description: 'Tareas completadas', example: 140 })
    completada: number;

    @ApiProperty({ description: 'Tareas fallidas', example: 3 })
    fallida: number;
}

export class TaskTypeCountResponse extends TaskStatusCountResponse implements TaskTypeCountInterface {
    @ApiProperty({ description: 'Tipo de tarea', enum: TaskTypeEnum, example: TaskTypeEnum.movement })
    type: string;

    @ApiProperty({ description: 'Total de tareas del tipo', example: 80 })
    total: number;
}

export class TaskSummaryResponse implements TaskSummaryInterface {
    @ApiProperty({ description: 'ID de la tarea (UUID)', format: 'uuid', example: '3f2b8c1e-6d4a-4b9e-9c1a-2e7f5d8a9b10' })
    id: string;

    @ApiProperty({ description: 'Tipo de tarea', enum: TaskTypeEnum, example: TaskTypeEnum.movement })
    type: string;

    @ApiProperty({ description: 'Estado de la tarea', enum: TaskStatusEnum, example: TaskStatusEnum.pending })
    status: string;

    @ApiProperty({ description: 'PIN (código) del empleado', example: '10045' })
    pin: string;

    @ApiProperty({ description: 'Fecha programada de ejecución', example: '2026-10-21' })
    scheduled_at: string;

    @ApiProperty({ description: 'Cantidad de intentos de ejecución', example: 1 })
    attempts: number;

    @ApiProperty({ description: 'Último error al ejecutar la tarea', type: String, nullable: true, example: 'El empleado no existe en ZKBioAccess' })
    last_error: string | null;

    @ApiProperty({ description: 'Nombre del usuario que programó la tarea', example: 'Juan Pérez López' })
    created_by: string;
}

export class DashboardTasksResponse implements DashboardTasksInterface {
    @ApiProperty({ description: 'Inicio del rango aplicado (yyyy-MM-dd)', example: '2026-10-01' })
    start_date: string;

    @ApiProperty({ description: 'Fin del rango aplicado, inclusivo (yyyy-MM-dd)', example: '2026-10-30' })
    end_date: string;

    @ApiProperty({ description: 'Tareas por estado (scheduled_at dentro del rango)', type: TaskStatusCountResponse })
    by_status: TaskStatusCountResponse;

    @ApiProperty({ description: 'Tareas por tipo y estado (scheduled_at dentro del rango)', type: [TaskTypeCountResponse] })
    by_type: TaskTypeCountResponse[];

    @ApiProperty({ description: 'Próximas 10 tareas pendientes desde hoy (ignora el rango)', type: [TaskSummaryResponse] })
    upcoming: TaskSummaryResponse[];

    @ApiProperty({ description: 'Últimas 10 tareas fallidas (ignora el rango)', type: [TaskSummaryResponse] })
    recent_failed: TaskSummaryResponse[];
}
