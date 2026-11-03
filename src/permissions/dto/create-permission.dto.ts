import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";
import { PermissionTypeEnum, SalaryStatusEnum } from "../entities/permission.entity.js";

export const SHIFT_TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreatePermissionDto {
    @ApiProperty({ description: 'PIN (código) del trabajador en ZKBioAccess', example: '11617' })
    @IsString()
    @IsNotEmpty()
    employee_pin: string;

    @ApiProperty({ description: 'Día del permiso (YYYY-MM-DD); acepta fechas pasadas y futuras', example: '2026-11-03' })
    @IsDateString({ strict: true })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date debe tener el formato YYYY-MM-DD' })
    date: string;

    @ApiProperty({ description: 'Tipo de permiso', enum: PermissionTypeEnum, example: PermissionTypeEnum.personal })
    @IsEnum(PermissionTypeEnum)
    type: PermissionTypeEnum;

    @ApiProperty({ description: 'Motivo de salida', example: 'Cita médica' })
    @IsString()
    @IsNotEmpty()
    reason: string;

    @ApiProperty({ description: 'Estado de salario del permiso', enum: SalaryStatusEnum, example: SalaryStatusEnum.paid })
    @IsEnum(SalaryStatusEnum)
    salary_status: SalaryStatusEnum;

    @ApiProperty({ description: 'Inicio de turno (HH:mm)', example: '06:00' })
    @Matches(SHIFT_TIME_REGEX, { message: 'shift_start debe tener el formato HH:mm' })
    shift_start: string;

    @ApiProperty({ description: 'Fin de turno (HH:mm); puede ser menor que el inicio si el turno cruza medianoche', example: '14:00' })
    @Matches(SHIFT_TIME_REGEX, { message: 'shift_end debe tener el formato HH:mm' })
    shift_end: string;

    @ApiPropertyOptional({ description: 'PIN (código) del comodín en ZKBioAccess; requiere substitute_signature', example: '10045' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    substitute_pin?: string;
}

// Solo documenta el cuerpo multipart; los archivos llegan por FileFieldsInterceptor
export class CreatePermissionMultipartDto extends CreatePermissionDto {
    @ApiProperty({ description: 'Firma del trabajador (PNG, máx. 1 MB)', type: 'string', format: 'binary' })
    employee_signature: any;

    @ApiPropertyOptional({ description: 'Firma del comodín (PNG, máx. 1 MB); obligatoria solo con substitute_pin', type: 'string', format: 'binary' })
    substitute_signature?: any;

    @ApiProperty({ description: 'Firma del jefe o supervisor de línea (PNG, máx. 1 MB)', type: 'string', format: 'binary' })
    supervisor_signature: any;

    @ApiProperty({ description: 'Firma del auditor de piso (PNG, máx. 1 MB)', type: 'string', format: 'binary' })
    floor_auditor_signature: any;
}
