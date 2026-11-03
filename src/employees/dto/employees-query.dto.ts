import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { PaginationDto } from "../../common/dto/pagination.dto.js";

export class EmployeesQueryDto extends PaginationDto {
    @ApiPropertyOptional({
        description: 'Filtro por nombre del empleado (búsqueda parcial)',
        type: String,
        example: 'Juan',
    })
    @IsOptional()
    @IsString()
    name: string;

    @ApiPropertyOptional({
        description: 'Filtro por PIN (código) del empleado (búsqueda parcial)',
        type: String,
        example: '10045',
    })
    @IsOptional()
    @IsString()
    pin: string;

    @ApiPropertyOptional({
        description: 'Filtro por ID del departamento del empleado (búsqueda parcial)',
        type: String,
        example: '4028898594b7f9660194b7fb25b00010',
    })
    @IsOptional()
    @IsString()
    auth_dept_id: string;
}