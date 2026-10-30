import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsString, IsUUID, Matches } from "class-validator";

export class CreateMovementTaskDto {
    @ApiProperty({ description: 'ID de la planificación semanal', format: 'uuid', example: '3f2b8c1e-6d4a-4b9e-9c1a-2e7f5d8a9b10' })
    @IsUUID()
    planification_id: string;

    @ApiProperty({ description: 'ID del empleado a mover (32 caracteres)', example: '4028898594b7f9660194b7fb5d7a0500' })
    @IsString()
    employee_id: string;

    @ApiProperty({ description: 'ID de la nueva posición (32 caracteres); su disponibilidad se valida al ejecutar la tarea', example: '4028898594b7f9660194b7fb5d7a0600' })
    @IsString()
    position_id: string;

    @ApiProperty({ description: 'ID del nuevo departamento (32 caracteres)', example: '4028898594b7f9660194b7fb5d7a0300' })
    @IsString()
    auth_dept_id: string;

    @ApiProperty({ description: 'IDs de los niveles de acceso a asignar, separados por coma', example: '4028898594b7f9660194b7fb5d7a0430' })
    @IsString()
    accLevelIds: string;

    @ApiProperty({ description: 'Fecha programada (YYYY-MM-DD); debe ser hoy o posterior y estar dentro de la semana de la planificación', example: '2026-11-03' })
    @IsDateString({ strict: true })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'scheduled_at debe tener el formato YYYY-MM-DD' })
    scheduled_at: string;
}
