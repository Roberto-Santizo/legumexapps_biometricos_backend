import { ApiProperty } from "@nestjs/swagger";
import { DashboardSummaryInterface } from "../interfaces/index.js";

export class DashboardSummaryResponse implements DashboardSummaryInterface {
    @ApiProperty({ description: 'Total de empleados activos', example: 850 })
    employees_total: number;

    @ApiProperty({ description: 'Total de departamentos', example: 24 })
    departments_total: number;

    @ApiProperty({ description: 'Total de posiciones', example: 900 })
    positions_total: number;

    @ApiProperty({ description: 'Posiciones con empleado asignado', example: 820 })
    positions_occupied: number;

    @ApiProperty({ description: 'Posiciones sin empleado asignado', example: 80 })
    positions_vacant: number;

    @ApiProperty({ description: 'Marcajes registrados hoy (UTC)', example: 1650 })
    transactions_today: number;

    @ApiProperty({ description: 'Empleados distintos que marcaron hoy (UTC)', example: 790 })
    employees_marked_today: number;

    @ApiProperty({ description: 'Tareas pendientes', example: 12 })
    tasks_pending: number;

    @ApiProperty({ description: 'Tareas fallidas', example: 3 })
    tasks_failed: number;

    @ApiProperty({ description: 'Bajas con leave_date dentro del rango', example: 15 })
    inactive_employees_in_range: number;

    @ApiProperty({ description: 'Total de fotos registradas', example: 700 })
    photos_total: number;
}
