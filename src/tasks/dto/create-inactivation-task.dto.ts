import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNotEmpty, IsString, IsUUID, Matches } from "class-validator";
import { InactivationField } from "../interfaces/index.js";

export class CreateInactivationTaskDto {
    @ApiProperty({ description: 'ID de la planificación semanal', format: 'uuid', example: '3f2b8c1e-6d4a-4b9e-9c1a-2e7f5d8a9b10' })
    @IsUUID()
    planification_id: string;

    @ApiProperty({ description: 'PIN (código) del empleado a dar de baja; su existencia se valida al ejecutar la tarea', example: '10045' })
    @IsString()
    @IsNotEmpty()
    pin: string;
    
    @ApiProperty({ description: 'Fecha programada (YYYY-MM-DD); debe ser hoy o posterior y estar dentro de la semana de la planificación', example: '2026-11-03' })
    @IsDateString({ strict: true })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'scheduled_at debe tener el formato YYYY-MM-DD' })
    scheduled_at: string;

    @ApiProperty({ description: 'Tipo de baja', enum: InactivationField, example: InactivationField.PERMANENT })
    @IsEnum(InactivationField)
    type: InactivationField;
}
