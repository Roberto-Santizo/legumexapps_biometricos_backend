import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, Matches } from 'class-validator';

// Campos de payload no aplicables al tipo de la tarea devuelven 400
export class UpdateTaskDto {
    @ApiPropertyOptional({ description: 'Nueva planificación semanal; el scheduled_at final debe caer en su semana', format: 'uuid', example: '3f2b8c1e-6d4a-4b9e-9c1a-2e7f5d8a9b10' })
    @IsOptional()
    @IsUUID()
    planification_id?: string;

    @ApiPropertyOptional({ description: 'Nueva fecha programada (YYYY-MM-DD); debe ser hoy o posterior', example: '2026-11-04' })
    @IsOptional()
    @IsDateString({ strict: true })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'scheduled_at debe tener el formato YYYY-MM-DD' })
    scheduled_at?: string;

    @ApiPropertyOptional({ description: 'Nueva posición (solo alta y movimiento)', example: '4028898594b7f9660194b7fb5d7a0600' })
    @IsOptional()
    @IsString()
    position_id?: string;

    @ApiPropertyOptional({ description: 'Nuevo departamento (solo alta y movimiento)', example: '4028898594b7f9660194b7fb5d7a0300' })
    @IsOptional()
    @IsString()
    auth_dept_id?: string;

    @ApiPropertyOptional({ description: 'Nuevos niveles de acceso separados por coma (solo alta y movimiento)', example: '4028898594b7f9660194b7fb5d7a0430' })
    @IsOptional()
    @IsString()
    accLevelIds?: string;

    @ApiPropertyOptional({ description: 'Nuevo nombre (solo alta)', example: 'Juan Carlos' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ description: 'Nuevos apellidos (solo alta)', example: 'Pérez López' })
    @IsOptional()
    @IsString()
    lastName?: string;
}
