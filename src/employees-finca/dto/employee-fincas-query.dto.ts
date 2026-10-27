import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto.js";
import { Type } from "class-transformer";

export class EmployeesFincasQueryDto extends PaginationDto {
    @ApiPropertyOptional({
        description: 'Filtro por apellidos del empleado (búsqueda parcial)',
        type: String,
        example: 'Pérez',
    })
    @IsOptional()
    last_name: string;

    @ApiPropertyOptional({
        description: 'Filtro por nombres del empleado (búsqueda parcial)',
        type: String,
        example: 'Juan',
    })
    @IsOptional()
    first_name: string;

    @ApiPropertyOptional({
        description: 'Filtro por código del empleado (búsqueda parcial)',
        type: String,
        example: '1045',
    })
    @IsOptional()
    emp_code: string;

    @ApiPropertyOptional({
        description: 'Filtro por ID de la posición del empleado',
        type: Number,
        example: 4,
    })
    @IsOptional()
    @Type(() => Number)
    position_id: number;
}