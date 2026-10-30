import { ApiProperty } from "@nestjs/swagger";
import { PlanificationCounts, PlanificationDetailInterface, PlanificationListInterface, PlanificationResourceInterface } from "../interfaces/index.js";
import { TaskResponse } from "../../tasks/resource/task.response.js";

export class PlanificationResponse implements PlanificationResourceInterface {
    @ApiProperty({ description: 'ID de la planificación (UUID)', format: 'uuid', example: '3f2b8c1e-6d4a-4b9e-9c1a-2e7f5d8a9b10' })
    id: string;

    @ApiProperty({ description: 'Año ISO de la semana', example: 2026 })
    year: number;

    @ApiProperty({ description: 'Semana ISO (1–53)', example: 45 })
    week: number;

    @ApiProperty({ description: 'Lunes de la semana (YYYY-MM-DD)', format: 'date', example: '2026-11-02' })
    start_date: string;

    @ApiProperty({ description: 'Domingo de la semana (YYYY-MM-DD)', format: 'date', example: '2026-11-08' })
    end_date: string;

    @ApiProperty({ description: 'Nombre del usuario que creó la planificación', example: 'Juan Pérez López' })
    created_by: string;
}

class PlanificationCountsByTypeResponse {
    @ApiProperty({ description: 'Tareas de movimiento', example: 3 })
    movimiento: number;

    @ApiProperty({ description: 'Tareas de alta', example: 2 })
    alta: number;

    @ApiProperty({ description: 'Tareas de baja', example: 1 })
    baja: number;
}

class PlanificationCountsByStatusResponse {
    @ApiProperty({ description: 'Tareas pendientes', example: 4 })
    pendiente: number;

    @ApiProperty({ description: 'Tareas completadas', example: 1 })
    completada: number;

    @ApiProperty({ description: 'Tareas fallidas', example: 1 })
    fallida: number;
}

class PlanificationCountsResponse implements PlanificationCounts {
    @ApiProperty({ description: 'Total de tareas de la semana', example: 6 })
    total: number;

    @ApiProperty({ description: 'Conteo por tipo de tarea', type: PlanificationCountsByTypeResponse })
    by_type: PlanificationCountsByTypeResponse;

    @ApiProperty({ description: 'Conteo por estado de tarea', type: PlanificationCountsByStatusResponse })
    by_status: PlanificationCountsByStatusResponse;
}

export class PlanificationListResponse extends PlanificationResponse implements PlanificationListInterface {
    @ApiProperty({ description: 'Conteos de tareas de la semana', type: PlanificationCountsResponse })
    counts: PlanificationCountsResponse;
}

export class PlanificationDetailResponse extends PlanificationResponse implements PlanificationDetailInterface {
    @ApiProperty({ description: 'Tareas de la semana ordenadas por fecha programada', type: [TaskResponse] })
    tasks: TaskResponse[];
}
