import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsIn, IsInt, IsOptional, IsString } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto.js";
import { PermissionTypeEnum, SalaryStatusEnum } from "../entities/permission.entity.js";
import { Type } from "class-transformer";

export class PermissionQueryDto extends PaginationDto {
    @ApiPropertyOptional({ description: 'PIN (código) del trabajador (búsqueda parcial)', type: String, example: '11617' })
    @IsOptional()
    @IsString()
    employee_pin?: string;

    @ApiPropertyOptional({ description: 'Nombre del trabajador (búsqueda parcial)', type: String, example: 'Juan' })
    @IsOptional()
    @IsString()
    employee_name?: string;

    @ApiPropertyOptional({ description: 'PIN (código) del comodín (búsqueda parcial)', type: String, example: '10045' })
    @IsOptional()
    @IsString()
    substitute_pin?: string;

    @ApiPropertyOptional({ description: 'Folio del permiso (coincidencia exacta)', type: Number, example: 1 })
    @IsOptional()
    @IsInt()
    @Type(() => Number)
    folio?: number;

    @ApiPropertyOptional({ description: "Día del permiso: 'YYYY-MM-DD' o rango 'desde,hasta'", type: String, example: '2026-11-01,2026-11-30' })
    @IsOptional()
    @IsString()
    date?: string;

    @ApiPropertyOptional({ description: 'Tipo de permiso', enum: PermissionTypeEnum, example: PermissionTypeEnum.personal })
    @IsOptional()
    @IsEnum(PermissionTypeEnum)
    type?: PermissionTypeEnum;

    @ApiPropertyOptional({ description: 'Estado de salario del permiso', enum: SalaryStatusEnum, example: SalaryStatusEnum.paid })
    @IsOptional()
    @IsEnum(SalaryStatusEnum)
    salary_status?: SalaryStatusEnum;

    @ApiPropertyOptional({ description: 'true: solo permisos con firma de RRHH; false: solo sin firma de RRHH', type: Boolean, example: false })
    @IsOptional()
    @IsIn(['true', 'false'], { message: 'hr_signed debe ser true o false' })
    hr_signed?: 'true' | 'false';
}
