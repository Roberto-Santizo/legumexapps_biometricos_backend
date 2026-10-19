import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto.js";

export class EmployeeTransactionQueryDto extends PaginationDto {
    @ApiPropertyOptional({
        description: "Fecha del evento (UTC). Acepta 'YYYY-MM-DD' (día completo), 'desde,hasta' (rango inclusivo por día) o fecha ISO completa (coincidencia exacta)",
        type: String,
        example: '2026-10-15',
    })
    @IsOptional()
    @IsString()
    event_time: string;

    @ApiPropertyOptional({
        description: 'Código del departamento (búsqueda parcial, sin distinguir mayúsculas)',
        type: String,
        example: '1',
    })
    @IsOptional()
    @IsString()
    dept_code: string;

    @ApiPropertyOptional({
        description: 'Nombre del departamento (búsqueda parcial, sin distinguir mayúsculas)',
        type: String,
        example: 'Producción',
    })
    @IsOptional()
    @IsString()
    dept_name: string;

    @ApiPropertyOptional({
        description: 'Apellidos del empleado (búsqueda parcial, sin distinguir mayúsculas)',
        type: String,
        example: 'Pérez',
    })
    @IsOptional()
    @IsString()
    last_name: string;

    @ApiPropertyOptional({
        description: 'Nombre del empleado (búsqueda parcial, sin distinguir mayúsculas)',
        type: String,
        example: 'Juan',
    })
    @IsOptional()
    @IsString()
    name: string;

    @ApiPropertyOptional({
        description: 'PIN (código) del empleado (búsqueda parcial)',
        type: String,
        example: '10045',
    })
    @IsOptional()
    @IsString()
    pin: string;
}
